const DATA_PATH = './Data/';

let classData = { logs: [], forum: [], grades: [] };
let charts = {};
let allStats = {};

document.addEventListener('DOMContentLoaded', init);

async function init() {
    await loadClasses();
    document.getElementById('generateBtn').addEventListener('click', generateReport);
    document.getElementById('viewMode').addEventListener('change', onViewModeChange);
}

function onViewModeChange() {
    const viewMode = document.getElementById('viewMode').value;
    const studentSelect = document.getElementById('studentSelect');

    if (viewMode === 'individual') {
        studentSelect.style.display = 'inline-block';
        if (allStats.studentStats && allStats.studentStats.length > 0) {
            populateStudentSelect(allStats.studentStats);
        }
    } else {
        studentSelect.style.display = 'none';
    }

    if (document.getElementById('reportArea').querySelector('.dashboard-section')) {
        generateReport();
    }
}

async function loadClasses() {
    const select = document.getElementById('classSelect');
    const classes = ['Class 1'];
    let options = '';
    classes.forEach(c => options += '<option value="' + c + '">' + c + '</option>');
    select.innerHTML = options;
}

function populateStudentSelect(students) {
    const select = document.getElementById('studentSelect');
    let options = '<option value="">全部學生</option>';
    students.forEach(s => {
        options += '<option value="' + s.name + '">' + s.name + '</option>';
    });
    select.innerHTML = options;
}

async function generateReport() {
    const className = document.getElementById('classSelect').value;
    const viewMode = document.getElementById('viewMode').value;
    const studentName = document.getElementById('studentSelect').value;
    const reportArea = document.getElementById('reportArea');

    if (!className) {
        reportArea.innerHTML = '<div class="error-message">請選擇班級</div>';
        return;
    }

    reportArea.innerHTML = '<div class="loading">載入數據中...</div>';

    try {
        await loadClassData(className);

        Object.values(charts).forEach(chart => {
            if (chart && chart.destroy) chart.destroy();
        });
        charts = {};

        allStats = calculateStats();
        populateStudentSelect(allStats.studentStats);

        if (viewMode === 'individual' && studentName) {
            const studentData = allStats.studentStats.find(s => s.name === studentName);
            if (!studentData) {
                reportArea.innerHTML = '<div class="error-message">找不到該學生</div>';
                return;
            }
            renderIndividualView(reportArea, studentData);
        } else if (viewMode === 'individual' && !studentName) {
            renderAllStudentsGrid(reportArea);
        } else if (viewMode === 'student') {
            renderStudentView(reportArea);
        } else {
            renderTeacherView(reportArea, className);
        }
    } catch (error) {
        console.error('生成報告失敗:', error);
        reportArea.innerHTML = '<div class="error-message">載入數據失敗: ' + error.message + '</div>';
    }
}

async function loadClassData(className) {
    const basePath = './Data/' + className + '/';
    classData = { logs: [], forum: [], grades: [] };
    
    const files = [
        { key: 'logs', names: ['dummy_moodle_logs_20_students', 'moodle_logs', 'logs'] },
        { key: 'forum', names: ['dummy_moodle_forum_20_students', 'moodle_forum', 'forum'] },
        { key: 'grades', names: ['dummy_grades_20_students', 'grades', 'grade'] }
    ];
    
    for (let f = 0; f < files.length; f++) {
        const file = files[f];
        for (let n = 0; n < file.names.length; n++) {
            try {
                const path = basePath + file.names[n] + '.csv';
                const res = await fetch(path);
                if (!res.ok) {
                    console.log('找不到: ' + file.names[n] + ' (HTTP ' + res.status + ')');
                    continue;
                }
                const text = await res.text();
                classData[file.key] = parseCSV(text);
                console.log('載入 ' + file.key + ': ' + classData[file.key].length + ' 筆');
                break;
            } catch (e) {
                console.log('讀取失敗: ' + file.names[n], e.message);
            }
        }
    }
    
    if (classData.logs.length === 0 && classData.forum.length === 0 && classData.grades.length === 0) {
        throw new Error('無法讀取任何數據檔案');
    }
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/\uFEFF/g, ''));
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => row[header] = values[index] || '');
        data.push(row);
    }
    return data;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else current += char;
    }
    result.push(current.trim());
    return result;
}

function renderTeacherView(container, className) {
    const stats = allStats;
    let html = '';
    
    // KPI 卡片
    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">' + className + ' - 儀表板總覽</h2>';
    html += '<div class="kpi-grid">';
    html += '<div class="kpi-card"><div class="kpi-value">' + stats.totalStudents + '</div><div class="kpi-label">總學生數</div></div>';
    html += '<div class="kpi-card orange"><div class="kpi-value">' + stats.totalActivities + '</div><div class="kpi-label">總活動次數</div></div>';
    html += '<div class="kpi-card green"><div class="kpi-value">' + stats.avgScore + '</div><div class="kpi-label">班級平均分</div></div>';
    html += '<div class="kpi-card yellow"><div class="kpi-value">' + stats.totalPosts + '</div><div class="kpi-label">論壇發帖</div></div>';
    html += '</div></div>';
    
    // 熱力圖
    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">學習熱力圖</h2>';
    html += '<div class="heatmap-container" id="heatmapContainer"></div>';
    html += '</div>';
    
    // 預測表格
    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">期末成績預測</h2>';
    html += '<table class="prediction-table"><thead><tr><th>學生</th><th>目前</th><th>預測</th><th>等級</th></tr></thead><tbody>';
    stats.studentStats.forEach(s => {
        html += '<tr class="' + getPredictedClass(s.predictedScore) + '">';
        html += '<td>' + s.name + '</td><td>' + s.currentScore + '</td><td><strong>' + s.predictedScore + '</strong></td><td>' + getGradeLevel(s.predictedScore) + '</td></tr>';
    });
    html += '</tbody></table></div>';
    
    // 內容分析 - 改用表格
    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">內容熱門分析</h2>';
    html += '<table class="content-table"><thead><tr><th>#</th><th>學習資源</th><th>次數</th><th>比例</th></tr></thead><tbody>';
    const totalContent = Object.values(stats.contentMap).reduce((a, b) => a + b, 0);
    const topContent = Object.entries(stats.contentMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    topContent.forEach((c, i) => {
        const pct = Math.round(c[1] / totalContent * 100);
        const shortName = shortenResource(c[0]);
        html += '<tr><td>' + (i + 1) + '</td><td>' + shortName + '</td><td>' + c[1] + '</td><td><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div><span>' + pct + '%</span></div></td></tr>';
    });
    html += '</tbody></table></div>';
    
    // 活動類型圖
    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">活動類型分布</h2>';
    html += '<div class="chart-container"><canvas id="activityTypeChart"></canvas></div></div>';
    
    // 風險預警
    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">風險預警</h2>';
    if (stats.alerts.length > 0) {
        html += '<div class="alerts-list">';
        stats.alerts.forEach(a => {
            html += '<div class="alert-item alert-' + a.type + '"><span>' + (a.type === 'danger' ? '!' : '!') + '</span> ' + a.message + '</div>';
        });
        html += '</div>';
    }
    html += '<table><thead><tr><th>學生</th><th>成績</th><th>風險</th><th>建議</th></tr></thead><tbody>';
    stats.studentStats.forEach(s => {
        html += '<tr class="' + getRiskClass(s.risk) + '">';
        html += '<td>' + s.name + '</td><td>' + formatScores(s.scores) + '</td><td>' + s.risk + '</td><td>' + getRecommendation(s) + '</td></tr>';
    });
    html += '</tbody></table></div>';
    
    // Top 排行
    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">Top 排行榜</h2>';
    html += '<div class="charts-grid"><div class="chart-container"><h3>最活躍</h3><ol class="rank-list">';
    stats.topActive.forEach(s => html += '<li>' + s.name + ' (' + s.activities + '次)</li>');
    html += '</ol></div><div class="chart-container"><h3>論壇最多</h3><ol class="rank-list">';
    stats.topPosters.forEach(s => html += '<li>' + s.name + ' (' + s.posts + '篇)</li>');
    html += '</ol></div></div></div>';
    
    // 學習時間線
    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">學習時間線</h2>';
    html += '<div class="chart-container"><canvas id="timelineChart"></canvas></div></div>';
    
    // 匯出
    html += '<div class="dashboard-section">';
    html += '<button class="export-btn" onclick="exportReport()">匯出 Excel</button></div>';
    
    container.innerHTML = html;
    renderCharts(stats);
    renderHeatmap(stats);
}

function renderStudentView(container) {
    const stats = allStats;
    const avgStats = getAverageStats();
    let html = '<div class="student-view-info"><h3>班級平均報告</h3><p>呈現全班平均數據，供一般學生參考</p></div>';

    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">班級統計</h2>';
    html += '<div class="kpi-grid">';
    html += '<div class="kpi-card"><div class="kpi-value">' + stats.totalStudents + '</div><div class="kpi-label">班級人數</div></div>';
    html += '<div class="kpi-card orange"><div class="kpi-value">' + avgStats.activities + '</div><div class="kpi-label">平均活動</div></div>';
    html += '<div class="kpi-card green"><div class="kpi-value">' + stats.avgScore + '</div><div class="kpi-label">平均分</div></div>';
    html += '<div class="kpi-card yellow"><div class="kpi-value">' + avgStats.posts + '</div><div class="kpi-label">人均發帖</div></div>';
    html += '</div></div>';

    html += '<div class="dashboard-section"><h2 class="section-title">學習趨勢</h2><div class="chart-container"><canvas id="trendChart"></canvas></div></div>';

    container.innerHTML = html;
    renderStudentCharts(avgStats);
}

function renderIndividualView(container, studentData) {
    const stats = allStats;
    const peerRankings = calculatePeerRankings(studentData);
    const narratives = generateStudentNarrative(studentData, stats);
    const noteKey = 'la_note_' + studentData.name;
    const savedNote = localStorage.getItem(noteKey) || '';
    const noteTime = localStorage.getItem(noteKey + '_time') || '';
    const initials = studentData.name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();

    let html = '';

    html += '<div class="search-stripe">';
    html += '<span style="font-weight:600;color:#667eea;">🔍 搜尋學生：</span>';
    html += '<input type="text" id="studentSearchInput" placeholder="輸入姓名搜尋..." oninput="filterStudentOptions(this.value)">';
    html += '</div>';

    html += '<div class="dashboard-section">';
    html += '<div class="student-profile-header">';
    html += '<div class="student-avatar">' + initials + '</div>';
    html += '<div class="student-info">';
    html += '<h3>' + studentData.name + '<span class="risk-badge ' + getRiskClass(studentData.risk) + '">' + studentData.risk + '</span></h3>';
    html += '<div class="student-meta"><span>預測分：' + studentData.predictedScore + '</span><span>目前分：' + studentData.currentScore + '</span><span>作業：' + (studentData.scores.assignment || '-') + ' / 論壇：' + (studentData.scores.forum || '-') + ' / 測驗：' + (studentData.scores.quiz || '-') + '</span></div>';
    html += '</div></div></div>';

    const avgStats = getAverageStats();
    const actDiff = studentData.activities - avgStats.activities;
    const actPct = avgStats.activities > 0 ? Math.round((actDiff / avgStats.activities) * 100) : 0;
    const scoreDiff = studentData.currentScore - stats.avgScore;
    const postDiff = studentData.posts - avgStats.posts;

    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">個人學習概覽</h2>';
    html += '<div class="individual-kpi-grid">';
    html += '<div class="individual-kpi-card"><div class="kpi-sub">' + studentData.activities + '</div><div class="kpi-label">總活動次數</div><div class="kpi-compare">' + (actDiff >= 0 ? '+' + actDiff : actDiff) + ' vs 班均 ' + avgStats.activities + '</div></div>';
    html += '<div class="individual-kpi-card"><div class="kpi-sub">' + studentData.posts + '</div><div class="kpi-label">論壇發帖</div><div class="kpi-compare">' + (postDiff >= 0 ? '+' + postDiff : postDiff) + ' vs 班均 ' + avgStats.posts + '</div></div>';
    html += '<div class="individual-kpi-card"><div class="kpi-sub">' + studentData.currentScore + '</div><div class="kpi-label">目前加權分</div><div class="kpi-compare">' + (scoreDiff >= 0 ? '+' + scoreDiff : scoreDiff) + ' vs 班均 ' + stats.avgScore + '</div></div>';
    html += '<div class="individual-kpi-card"><div class="kpi-sub">' + studentData.predictedScore + '</div><div class="kpi-label">期末預測分</div><div class="kpi-compare">等級：' + getGradeLevel(studentData.predictedScore) + '</div></div>';
    html += '</div></div>';

    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">學習行為文字解讀</h2>';
    html += '<div class="narrative-card">';
    narratives.forEach(n => {
        html += '<div class="narrative-item"><div class="narrative-icon ' + n.type + '">!</div><div>' + n.text + '</div></div>';
    });
    html += '</div></div>';

    html += '<div class="charts-2col">';
    html += '<div class="dashboard-section"><h2 class="section-title">個人學習熱力圖</h2><div class="heatmap-container" id="studentHeatmap"></div></div>';
    html += '<div class="dashboard-section"><h2 class="section-title">活動趨勢（vs 班級平均）</h2><div class="chart-container"><canvas id="individualTrendChart"></canvas></div></div>';
    html += '</div>';

    html += '<div class="charts-2col">';
    html += '<div class="dashboard-section"><h2 class="section-title">學習內容偏好雷達圖</h2><div class="chart-container"><canvas id="radarChart"></canvas></div></div>';
    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">班級同儕排名</h2>';
    html += '<div class="peer-compare-table">';

    const dims = [
        { label: '活動量', key: 'activities', max: stats.topActive[0]?.activities || 1 },
        { label: '論壇發帖', key: 'posts', max: stats.topPosters[0]?.posts || 1 },
        { label: '目前分', key: 'currentScore', max: 100 },
        { label: '預測分', key: 'predictedScore', max: 100 }
    ];

    dims.forEach(d => {
        const val = studentData[d.key] || 0;
        const pct = Math.round((val / d.max) * 100);
        const rank = peerRankings[d.key] || 1;
        const rankLabel = '#' + rank + ' / ' + stats.totalStudents;
        const color = pct > 70 ? '#27ae60' : pct > 40 ? '#f39c12' : '#e74c3c';
        html += '<div class="peer-compare-row">';
        html += '<div class="peer-compare-label">' + d.label + '</div>';
        html += '<div class="peer-bar-bg"><div class="peer-bar-fill" style="width:' + pct + '%;background:' + color + '"><span class="peer-bar-value">' + pct + '%</span></div></div>';
        html += '<div class="peer-rank">' + rankLabel + '</div>';
        html += '</div>';
    });

    html += '</div></div></div>';

    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">老師備註</h2>';
    html += '<div class="teacher-notes-section">';
    html += '<textarea id="teacherNote" placeholder="寫下對此學生的觀察、備註或標籤...">' + savedNote + '</textarea>';
    html += '<div class="notes-actions">';
    html += '<button class="save-note" onclick="saveTeacherNote(\'' + escapeForJS(studentData.name) + '\')">儲存備註</button>';
    html += '<button class="clear-note" onclick="clearTeacherNote(\'' + escapeForJS(studentData.name) + '\')">清除</button>';
    html += '</div>';
    if (noteTime) html += '<div class="notes-timestamp">上次儲存：' + noteTime + '</div>';
    html += '</div></div>';

    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">匯出個人報告</h2>';
    html += '<div class="individual-export-section">';
    html += '<button class="export-individual-btn excel" onclick="exportIndividualReport(\'' + escapeForJS(studentData.name) + '\')">匯出 Excel</button>';
    html += '</div></div>';

    container.innerHTML = html;

    renderIndividualCharts(studentData, stats);
    renderStudentHeatmap(studentData, stats);
}

function getCardInsight(student) {
    if (student.risk === '高風險') {
        if (student.activities < 50) return { type: 'danger', text: '⚠️ 活動過少（' + student.activities + '次），立即關注' };
        if (student.currentScore < 60) return { type: 'danger', text: '📉 目前分過低（' + student.currentScore + '），需輔導' };
        return { type: 'danger', text: '🚨 高風險學生，需安排輔導' };
    }
    if (student.risk === '中風險') {
        if (student.posts < 3) return { type: 'warning', text: '💬 論壇參與低，建議多發言互動' };
        if (student.scores.assignment && student.scores.assignment < 75) return { type: 'warning', text: '📝 作業分偏低，可加強練習' };
        return { type: 'warning', text: '⚡ 中風險，維持觀察並提供支持' };
    }
    const trend = getActivityTrend(student);
    if (trend === 'increasing') return { type: 'success', text: '📈 近七天活動上升，表現值得肯定' };
    if (student.predictedScore >= 90) return { type: 'success', text: '🏆 預測分 ' + student.predictedScore + '，表現優異' };
    return { type: 'success', text: '✅ 學習狀況良好，維持當前節奏' };
}

function renderAllStudentsGrid(container) {
    const stats = allStats;
    const sorted = [...stats.studentStats].sort((a, b) => {
        const riskOrder = r => r === '高風險' ? 0 : r === '中風險' ? 1 : 2;
        return riskOrder(a.risk) - riskOrder(b.risk);
    });

    const counts = { all: sorted.length, high: sorted.filter(s => s.risk === '高風險').length, medium: sorted.filter(s => s.risk === '中風險').length, low: sorted.filter(s => s.risk === '低風險').length };

    let html = '';
    html += '<div class="dashboard-section">';
    html += '<h2 class="section-title">個人學習概覽（' + stats.totalStudents + ' 位學生）</h2>';
    html += '<div class="risk-filter-bar">';
    html += '<button class="risk-filter-btn active" onclick="filterStudentCards(\'all\', this)">全部 <span class="count-badge">' + counts.all + '</span></button>';
    html += '<button class="risk-filter-btn" onclick="filterStudentCards(\'high\', this)">高風險 <span class="count-badge">' + counts.high + '</span></button>';
    html += '<button class="risk-filter-btn" onclick="filterStudentCards(\'medium\', this)">中風險 <span class="count-badge">' + counts.medium + '</span></button>';
    html += '<button class="risk-filter-btn" onclick="filterStudentCards(\'low\', this)">低風險 <span class="count-badge">' + counts.low + '</span></button>';
    html += '</div>';
    html += '<div class="student-card-grid" id="studentCardGrid">';

    sorted.forEach(s => {
        const initials = s.name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
        const riskClass = s.risk === '高風險' ? 'risk-high-card' : s.risk === '中風險' ? 'risk-medium-card' : 'risk-low-card';
        const insight = getCardInsight(s);
        const riskBadgeClass = s.risk === '高風險' ? 'risk-high' : s.risk === '中風險' ? 'risk-medium' : 'risk-low';

        html += '<div class="student-card ' + riskClass + '" data-risk="' + s.risk + '" onclick="drillDownToStudent(\'' + escapeForJS(s.name) + '\')">';
        html += '<div class="student-card-header">';
        html += '<div class="student-card-avatar">' + initials + '</div>';
        html += '<div class="student-card-info"><h4>' + s.name + '</h4><div class="meta">預測 ' + s.predictedScore + '分 · 等級 ' + getGradeLevel(s.predictedScore) + '</div></div>';
        html += '<div class="student-card-risk ' + riskBadgeClass + '">' + s.risk + '</div>';
        html += '</div>';

        html += '<div class="student-card-kpi">';
        html += '<div class="student-card-kpi-item"><div class="val">' + s.currentScore + '</div><div class="lbl">目前分</div></div>';
        html += '<div class="student-card-kpi-item"><div class="val">' + s.activities + '</div><div class="lbl">活動</div></div>';
        html += '<div class="student-card-kpi-item"><div class="val">' + s.posts + '</div><div class="lbl">論壇</div></div>';
        html += '</div>';

        html += '<div class="student-card-insight ' + insight.type + '">' + insight.text + '</div>';

        html += '<div class="student-card-score-bar">';
        const scoreItems = [
            { label: '作業', val: s.scores.assignment, color: '#667eea' },
            { label: '論壇', val: s.scores.forum ? s.scores.forum * 10 : null, color: '#9b59b6' },
            { label: '測驗', val: s.scores.quiz ? s.scores.quiz * 10 : null, color: '#e74c3c' }
        ];
        scoreItems.forEach(item => {
            if (item.val != null) {
                html += '<div class="student-card-score-row">';
                html += '<div class="slabel">' + item.label + '</div>';
                html += '<div class="bar-bg"><div class="bar-fill" style="width:' + item.val + '%;background:' + item.color + '"></div></div>';
                html += '<div class="bar-val">' + item.val + '</div>';
                html += '</div>';
            }
        });
        html += '</div>';

        html += '<div class="student-card-footer"><a href="javascript:void(0)">查看完整報告 ▶</a></div>';
        html += '</div>';
    });

    html += '</div></div>';
    container.innerHTML = html;
}

function filterStudentCards(risk, btn) {
    document.querySelectorAll('.risk-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cards = document.querySelectorAll('.student-card');
    cards.forEach(card => {
        card.style.display = (risk === 'all' || card.dataset.risk === (risk === 'high' ? '高風險' : risk === 'medium' ? '中風險' : '低風險')) ? '' : 'none';
    });
}

function drillDownToStudent(studentName) {
    const studentData = allStats.studentStats.find(s => s.name === studentName);
    if (!studentData) return;
    const reportArea = document.getElementById('reportArea');
    let html = '<button class="back-to-grid-btn" onclick="backToGrid()">◀ 返回全部學生</button>';
    reportArea.innerHTML = html;
    renderIndividualView(reportArea, studentData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToGrid() {
    const reportArea = document.getElementById('reportArea');
    renderAllStudentsGrid(reportArea);
}

function calculatePeerRankings(studentData) {
    const stats = allStats;
    const rankings = {};
    ['activities', 'posts', 'currentScore', 'predictedScore'].forEach(key => {
        const sorted = [...stats.studentStats].sort((a, b) => (b[key] || 0) - (a[key] || 0));
        rankings[key] = sorted.findIndex(s => s.name === studentData.name) + 1;
    });
    return rankings;
}

function escapeForJS(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function filterStudentOptions(query) {
    const select = document.getElementById('studentSelect');
    if (!select) return;
    const options = select.options;
    const q = query.toLowerCase().trim();
    let visibleCount = 0;
    for (let i = 0; i < options.length; i++) {
        const match = q === '' || options[i].text.toLowerCase().includes(q);
        options[i].style.display = match ? '' : 'none';
        if (match) visibleCount++;
    }
}

function generateStudentNarrative(student, stats) {
    const narratives = [];
    const avgStats = getAverageStats();

    if (student.activities < 50) {
        narratives.push({ type: 'danger', text: '⚠️ 活動次數過低（' + student.activities + '次），可能需要關注學習參與度。' });
    } else if (student.activities > avgStats.activities * 2) {
        narratives.push({ type: 'warning', text: '📊 活動次數高於平均（' + student.activities + '次 vs 班均 ' + avgStats.activities + '），積極參與平台學習。' });
    } else {
        narratives.push({ type: 'success', text: '📈 活動量正常（' + student.activities + '次），與班級平均水平相當。' });
    }

    if (student.posts < avgStats.posts * 0.5) {
        narratives.push({ type: 'warning', text: '💬 論壇發帖偏少（' + student.posts + '篇 vs 班均 ' + avgStats.posts + '），建議多參與討論互動。' });
    } else if (student.posts > avgStats.posts * 1.5) {
        narratives.push({ type: 'success', text: '💬 論壇互動活躍（' + student.posts + '篇），主動參與討論區互動。' });
    }

    const scores = student.scores;
    if (scores.assignment && scores.assignment < 60) {
        narratives.push({ type: 'danger', text: '📝 作業分數偏低（' + scores.assignment + '/100），需要加強作業練習。' });
    }
    if (scores.quiz && scores.quiz < 60) {
        narratives.push({ type: 'danger', text: '📋 測驗分數偏低（' + scores.quiz + '/100），建議加強考前複習。' });
    }
    if (scores.forum && scores.forum < 6) {
        narratives.push({ type: 'warning', text: '💬 論壇表現略低（' + scores.forum + '/10），可多參與討論提升互動分。' });
    }

    if (student.predictedScore >= 90) {
        narratives.push({ type: 'success', text: '🏆 預測期末成績優秀（' + student.predictedScore + '分），目前表現值得肯定。' });
    } else if (student.predictedScore < 70) {
        narratives.push({ type: 'danger', text: '📉 預測期末成績有風險（' + student.predictedScore + '分），建議加強輔導。' });
    }

    const activityTrend = getActivityTrend(student);
    if (activityTrend === 'increasing') {
        narratives.push({ type: 'success', text: '📈 近七天學習活動呈上升趨勢，學習態度積極。' });
    } else if (activityTrend === 'decreasing') {
        narratives.push({ type: 'warning', text: '📉 近七天學習活動呈下降趨勢，需注意學習動力和持續性。' });
    }

    if (student.risk === '高風險') {
        narratives.push({ type: 'danger', text: '🚨 風險等級【高風險】，強烈建議安排個別輔導並持續追蹤。' });
    } else if (student.risk === '中風險') {
        narratives.push({ type: 'warning', text: '⚡ 風險等級【中風險】，建議定期追蹤並提供學習支持。' });
    } else {
        narratives.push({ type: 'success', text: '✅ 風險等級【低風險】，學習狀況良好，維持當前節奏即可。' });
    }

    return narratives;
}

function getActivityTrend(student) {
    const studentLogs = classData.logs.filter(log => (log['User full name'] || '') === student.name);
    if (studentLogs.length < 5) return 'unknown';

    const now = new Date();
    const recent = studentLogs.filter(log => {
        try {
            const parts = (log['Time'] || '').split(',')[0].trim().split('/');
            if (parts.length === 3) {
                const d = new Date(parts[2], parts[1] - 1, parts[0]);
                const diffDays = (now - d) / (1000 * 60 * 60 * 24);
                return diffDays <= 7;
            }
        } catch (e) {}
        return false;
    });
    const older = studentLogs.filter(log => {
        try {
            const parts = (log['Time'] || '').split(',')[0].trim().split('/');
            if (parts.length === 3) {
                const d = new Date(parts[2], parts[1] - 1, parts[0]);
                const diffDays = (now - d) / (1000 * 60 * 60 * 24);
                return diffDays > 7 && diffDays <= 14;
            }
        } catch (e) {}
        return false;
    });

    if (recent.length > older.length * 1.3) return 'increasing';
    if (recent.length < older.length * 0.7) return 'decreasing';
    return 'stable';
}

function renderIndividualCharts(student, stats) {
    const avgStats = getAverageStats();
    const dailyData = getStudentDailyData(student);

    if (document.getElementById('individualTrendChart')) {
        charts.individualTrendChart = new Chart(document.getElementById('individualTrendChart'), {
            type: 'line',
            data: {
                labels: dailyData.labels,
                datasets: [
                    { label: student.name, data: dailyData.data, borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.1)', fill: true, tension: 0.4 },
                    { label: '班級平均', data: dailyData.avgData, borderColor: '#ccc', borderDash: [5, 5], fill: false, tension: 0.4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    if (document.getElementById('radarChart')) {
        const radarData = getStudentRadarData(student);
        charts.radarChart = new Chart(document.getElementById('radarChart'), {
            type: 'radar',
            data: {
                labels: radarData.labels,
                datasets: [{
                    label: student.name,
                    data: radarData.values,
                    backgroundColor: 'rgba(102,126,234,0.2)',
                    borderColor: '#667eea',
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    r: { beginAtZero: true, max: 100 }
                }
            }
        });
    }
}

function getStudentDailyData(student) {
    const studentLogs = classData.logs.filter(log => (log['User full name'] || '') === student.name);
    const daily = {};
    studentLogs.forEach(log => {
        const time = log['Time'] || '';
        if (time) {
            const date = time.split(',')[0].trim();
            daily[date] = (daily[date] || 0) + 1;
        }
    });
    const labels = Object.keys(daily).slice(-14);
    const data = labels.map(l => daily[l]);
    const avgData = data.map(() => Math.round(getAverageStats().activities / 7));

    return { labels, data, avgData };
}

function getStudentRadarData(student) {
    const avgStats = getAverageStats();
    const activityScore = Math.min(100, Math.round((student.activities / (avgStats.activities || 1)) * 100));
    const postScore = Math.min(100, Math.round((student.posts / (avgStats.posts || 1)) * 100));
    const assignmentScore = student.scores.assignment || 0;
    const quizScore = student.scores.quiz ? student.scores.quiz * 10 : 50;
    const forumScore = student.scores.forum ? student.scores.forum * 10 : 50;
    const trendScore = getTrendScore(student);

    return {
        labels: ['活動量', '論壇互動', '作業分', '測驗分', '論壇作業', '學習趨勢'],
        values: [activityScore, postScore, assignmentScore, quizScore, forumScore, trendScore]
    };
}

function getTrendScore(student) {
    const trend = getActivityTrend(student);
    if (trend === 'increasing') return 85;
    if (trend === 'decreasing') return 40;
    return 65;
}

function renderStudentHeatmap(student, stats) {
    const container = document.getElementById('studentHeatmap');
    if (!container) return;

    const studentLogs = classData.logs.filter(log => (log['User full name'] || '') === student.name);
    const timeMap = {};
    studentLogs.forEach(log => {
        const dh = getDayAndHour(log['Time'] || '');
        if (dh) {
            if (!timeMap[dh.day]) timeMap[dh.day] = {};
            timeMap[dh.day][dh.hour] = (timeMap[dh.day][dh.hour] || 0) + 1;
        }
    });

    let html = '<div class="heatmap-wrapper">';
    html += '<div class="heatmap-row heatmap-header"><div></div>';
    for (let h = 0; h < 24; h++) html += '<div>' + (h < 10 ? '0' + h : h) + 'h</div>';
    html += '</div>';

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let maxVal = 0;
    Object.values(timeMap).forEach(dayData => {
        Object.values(dayData).forEach(v => { if (v > maxVal) maxVal = v; });
    });

    days.forEach(day => {
        html += '<div class="heatmap-row"><div class="heatmap-day-label">' + day + '</div>';
        for (let h = 0; h < 24; h++) {
            const count = (timeMap[day] && timeMap[day][h]) || 0;
            const intensity = maxVal > 0 ? count / maxVal : 0;
            const r = Math.round(255 - intensity * 180);
            const g = Math.round(255 - intensity * 220);
            const b = Math.round(255 - intensity * 180);
            const color = count > 0 ? 'rgb(' + r + ',' + g + ',' + b + ')' : '#f0f0f0';
            const text = count > 0 ? count : '';
            const tooltip = day + ' ' + h + ':00 - ' + count + '次（' + student.name + '）';
            html += '<div class="heatmap-cell" style="background:' + color + '" title="' + tooltip + '">' + text + '</div>';
        }
        html += '</div>';
    });
    html += '</div>';
    html += '<div class="heatmap-legend"><span>少</span><div class="legend-bar"></div><span>多</span></div>';

    container.innerHTML = html;
}

function calculateStats() {
    const studentMap = {};
    const timeMap = {};
    const contentMap = {};
    const activityMap = {};
    const alerts = [];
    const forumReplies = [];
    
    // 處理 logs
    classData.logs.forEach(log => {
        const name = log['User full name'] || '';
        const time = log['Time'] || '';
        const eventContext = log['Event context'] || '';
        const component = log['Component'] || '';
        
        if (!name) return;
        if (!studentMap[name]) studentMap[name] = { activities: 0, posts: 0, scores: {} };
        studentMap[name].activities++;
        
        const dayHour = getDayAndHour(time);
        if (dayHour) {
            if (!timeMap[dayHour.day]) timeMap[dayHour.day] = {};
            timeMap[dayHour.day][dayHour.hour] = (timeMap[dayHour.day][dayHour.hour] || 0) + 1;
        }
        
        if (eventContext) contentMap[eventContext] = (contentMap[eventContext] || 0) + 1;
        activityMap[component] = (activityMap[component] || 0) + 1;
    });
    
    // 處理 forum
    classData.forum.forEach(post => {
        const name = post['userfullname'] || '';
        const parent = post['parent'] || '';
        if (!name) return;
        if (!studentMap[name]) studentMap[name] = { activities: 0, posts: 0, scores: {} };
        studentMap[name].posts++;
        if (parent && parent !== '0') forumReplies.push({ replier: name, parent: parent });
    });
    
    // 處理 grades
    classData.grades.forEach(grade => {
        const name = 'Student ' + grade['Last name'];
        if (!name || name === 'Student ') return;
        if (!studentMap[name]) studentMap[name] = { activities: 0, posts: 0, scores: {} };
        
        const a = grade['Assignment: Case Study: Algorithmic Bias'];
        const f = grade['Forum: Discussion: AI and Bias'];
        const q = grade['Quiz: Quiz 1: Data Privacy Concepts'];
        
        if (a && a !== '-') studentMap[name].scores.assignment = parseFloat(a);
        if (f && f !== '-') studentMap[name].scores.forum = parseFloat(f);
        if (q && q !== '-') studentMap[name].scores.quiz = parseFloat(q);
    });
    
    // 行為警訊
    Object.keys(studentMap).forEach(name => {
        const data = studentMap[name];
        if (data.activities < 50) alerts.push({ type: 'warning', message: name + ' 活動過少 (' + data.activities + '次)' });
        if (data.activities > 2000) alerts.push({ type: 'danger', message: name + ' 活動異常 (' + data.activities + '次)' });
    });
    
    // 計算學生統計
    const studentStats = Object.keys(studentMap).map(name => {
        const data = studentMap[name];
        const currentScore = calculateCurrentScore(data.scores);
        const predictedScore = Math.round(currentScore * 0.7 + Math.min(100, data.activities / 10) * 0.3);
        
        return {
            name: name,
            activities: data.activities,
            posts: data.posts,
            scores: data.scores,
            currentScore: currentScore,
            predictedScore: predictedScore,
            improvement: Math.round((predictedScore - currentScore) / 5),
            risk: calculateRisk(data.activities, data.posts, currentScore)
        };
    }).sort((a, b) => b.activities - a.activities);
    
    const totalActivities = studentStats.reduce((sum, s) => sum + s.activities, 0);
    const totalPosts = studentStats.reduce((sum, s) => sum + s.posts, 0);
    const avgScore = studentStats.length ? Math.round(studentStats.reduce((sum, s) => sum + s.currentScore, 0) / studentStats.length) : 0;
    
    return {
        totalStudents: studentStats.length,
        totalActivities: totalActivities,
        totalPosts: totalPosts,
        avgScore: avgScore,
        studentStats: studentStats,
        timeMap: timeMap,
        contentMap: contentMap,
        activityMap: activityMap,
        alerts: alerts,
        forumReplies: forumReplies,
        topActive: studentStats.slice(0, 5),
        topPosters: studentStats.slice(0, 5).sort((a, b) => b.posts - a.posts),
        topImproved: studentStats.slice(0, 5).sort((a, b) => b.improvement - a.improvement)
    };
}

function getDayAndHour(timeStr) {
    if (!timeStr) return null;
    try {
        const parts = timeStr.split(',')[0].trim().split('/');
        if (parts.length === 3) {
            const dayNum = parseInt(parts[0]);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            // 假設 Date format 是 DD/MM/YYYY
            const date = new Date(parts[2], parts[1] - 1, parts[0]);
            const day = isNaN(date.getDay()) ? 'Mon' : days[date.getDay()];
            let hour = '12';
            const timeParts = timeStr.split(',')[1];
            if (timeParts) {
                const hourParts = timeParts.trim().split(':');
                hour = hourParts[0] || '12';
            }
            return { day: day, hour: hour };
        }
        return { day: 'Mon', hour: '12' };
    } catch (e) {
        return { day: 'Mon', hour: '12' };
    }
}

function calculateCurrentScore(scores) {
    let total = 0, weight = 0;
    if (scores.assignment !== undefined) { total += scores.assignment * 0.5; weight += 50; }
    if (scores.forum !== undefined) { total += scores.forum * 10 * 0.2; weight += 20; }
    if (scores.quiz !== undefined) { total += scores.quiz * 10 * 0.3; weight += 30; }
    return weight > 0 ? Math.round(total / (weight / 100)) : 0;
}

function calculateRisk(activities, posts, avgScore) {
    if (activities < 50 || avgScore < 60) return '高風險';
    if (activities < 100 || avgScore < 75) return '中風險';
    return '低風險';
}

function getPredictedClass(score) {
    if (score >= 90) return 'grade-a';
    if (score >= 80) return 'grade-b';
    if (score >= 70) return 'grade-c';
    return 'grade-d';
}

function getGradeLevel(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'D';
}

function formatScores(scores) {
    return (scores.assignment || '-') + '/' + (scores.forum || '-') + '/' + (scores.quiz || '-');
}

function getRecommendation(student) {
    if (student.risk === '高風險') return '需輔導';
    if (student.risk === '中風險') return '建議加強';
    return '良好';
}

function getRiskClass(risk) {
    if (risk === '高風險') return 'risk-high';
    if (risk === '中風險') return 'risk-medium';
    return 'risk-low';
}

function getAverageStats() {
    const stats = allStats;
    const total = stats.totalStudents || 1;
    return { activities: Math.round(stats.totalActivities / total), posts: Math.round(stats.totalPosts / total) };
}

function renderCharts(stats) {
    // 活動類型圖（內容分析已改用表格）
    charts.activityTypeChart = new Chart(document.getElementById('activityTypeChart'), {
        type: 'doughnut',
        data: { labels: Object.keys(stats.activityMap), datasets: [{ data: Object.values(stats.activityMap), backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // 時間線
    const dailyData = getDailyActivityData();
    charts.timelineChart = new Chart(document.getElementById('timelineChart'), {
        type: 'line',
        data: { labels: dailyData.labels, datasets: [{ label: '每日活動', data: dailyData.data, borderColor: '#3498db', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderStudentCharts(avgStats) {
    charts.trendChart = new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: { labels: ['W1', 'W2', 'W3', 'W4'], datasets: [{ label: '活動', data: [avgStats.activities * 0.8, avgStats.activities * 0.9, avgStats.activities, avgStats.activities * 1.1], borderColor: '#3498db' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function truncateName(str, len) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
}

function shortenResource(name) {
    if (!name) return '';
    // 縮短資源名稱
    name = name.replace(/^(Assignment|Quiz|File|URL|Page|Folder|Forum|Course|System):\s*/, '');
    name = name.replace(/:\s*(Course module viewed|A submission|Quiz attempt|Discussion viewed)$/, '');
    return name.length > 35 ? name.substring(0, 35) + '...' : name;
}

function renderHeatmap(stats) {
    const container = document.getElementById('heatmapContainer');
    if (!container) return;
    
    let html = '<div class="heatmap-wrapper">';
    html += '<div class="heatmap-row heatmap-header"><div></div>';
    for (let h = 0; h < 24; h++) html += '<div>' + (h < 10 ? '0' + h : h) + 'h</div>';
    html += '</div>';
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let maxVal = 0;
    Object.values(stats.timeMap).forEach(dayData => {
        Object.values(dayData).forEach(v => { if (v > maxVal) maxVal = v; });
    });
    
    days.forEach(day => {
        html += '<div class="heatmap-row"><div class="heatmap-day-label">' + day + '</div>';
        for (let h = 0; h < 24; h++) {
            const count = (stats.timeMap[day] && stats.timeMap[day][h]) || 0;
            const intensity = maxVal > 0 ? count / maxVal : 0;
            const r = Math.round(255 - intensity * 180);
            const g = Math.round(255 - intensity * 220);
            const b = Math.round(255 - intensity * 180);
            const color = count > 0 ? 'rgb(' + r + ',' + g + ',' + b + ')' : '#f0f0f0';
            const text = count > 0 ? count : '';
            const tooltip = day + ' ' + h + ':00 - ' + count + '次';
            html += '<div class="heatmap-cell" style="background:' + color + '" title="' + tooltip + '">' + text + '</div>';
        }
        html += '</div>';
    });
    html += '</div>';
    
    // 添加圖例
    html += '<div class="heatmap-legend"><span>少</span><div class="legend-bar"></div><span>多</span></div>';
    
    container.innerHTML = html;
}

function getDailyActivityData() {
    const daily = {};
    classData.logs.forEach(log => {
        const time = log['Time'] || '';
        if (time) {
            const date = time.split(',')[0].trim();
            daily[date] = (daily[date] || 0) + 1;
        }
    });
    const labels = Object.keys(daily).slice(0, 14);
    return { labels: labels, data: labels.map(l => daily[l]) };
}

function exportReport() {
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(allStats.studentStats.map(s => ({
        學生: s.name, 活動: s.activities, 發帖: s.posts, 作業: s.scores.assignment, 論壇: s.scores.forum, 測驗: s.scores.quiz, 目前分: s.currentScore, 預測分: s.predictedScore, 風險: s.risk
    })));
    XLSX.utils.book_append_sheet(wb, ws1, '報告');
    XLSX.writeFile(wb, '學習分析報告.xlsx');
}

function saveTeacherNote(studentName) {
    const note = document.getElementById('teacherNote').value;
    const time = new Date().toLocaleString('zh-TW');
    localStorage.setItem('la_note_' + studentName, note);
    localStorage.setItem('la_note_' + studentName + '_time', time);
    document.querySelector('.notes-timestamp').textContent = '上次儲存：' + time;
}

function clearTeacherNote(studentName) {
    document.getElementById('teacherNote').value = '';
    localStorage.removeItem('la_note_' + studentName);
    localStorage.removeItem('la_note_' + studentName + '_time');
    document.querySelector('.notes-timestamp').textContent = '';
}

function exportIndividualReport(studentName) {
    const student = allStats.studentStats.find(s => s.name === studentName);
    if (!student) return;

    const narratives = generateStudentNarrative(student, allStats);
    const wb = XLSX.utils.book_new();

    const studentSheet = XLSX.utils.json_to_sheet([{
        學生姓名: student.name,
        風險等級: student.risk,
        總活動次數: student.activities,
        論壇發帖: student.posts,
        作業分: student.scores.assignment || '-',
        論壇分: student.scores.forum || '-',
        測驗分: student.scores.quiz || '-',
        目前加權分: student.currentScore,
        期末預測分: student.predictedScore,
        建議: getRecommendation(student)
    }]);
    XLSX.utils.book_append_sheet(wb, studentSheet, '學生概況');

    const narrativeSheet = XLSX.utils.json_to_sheet(narratives.map(n => ({ 觀察類型: n.type, 內容: n.text })));
    XLSX.utils.book_append_sheet(wb, narrativeSheet, '行為解讀');

    const note = localStorage.getItem('la_note_' + studentName) || '';
    const noteSheet = XLSX.utils.json_to_sheet([{ 老師備註: note }]);
    XLSX.utils.book_append_sheet(wb, noteSheet, '老師備註');

    XLSX.writeFile(wb, studentName + '_學習報告.xlsx');
}