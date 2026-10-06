const svg = document.getElementById('visualization-canvas');
const kValueInput = document.getElementById('k-value');
const resetButton = document.getElementById('reset-button');
const explanationBox = document.querySelector('#explanation-box p');
const svgNS = "http://www.w3.org/2000/svg";

let points = [];
let isAnimating = false; // Prevents clicks during animation

const initialExplanation = "Click on the white canvas to add a new point to be classified.";

function updateExplanation(text) {
    explanationBox.textContent = text;
}

function initializeData() {
    isAnimating = false;
    svg.innerHTML = '';
    points = [];
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    for (let i = 0; i < 30; i++) {
        const classId = Math.random() > 0.5 ? 0 : 1;
        const centerX = classId === 0 ? width * 0.25 : width * 0.75;
        const centerY = height * 0.5;
        points.push({
            x: centerX + (Math.random() - 0.5) * (width * 0.3),
            y: centerY + (Math.random() - 0.5) * (height * 0.6),
            class: classId
        });
    }
    renderPoints();
    updateExplanation(initialExplanation);
}

function renderPoints() {
    svg.innerHTML = '';
    points.forEach(p => {
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', p.x);
        circle.setAttribute('cy', p.y);
        circle.setAttribute('r', 8);
        circle.setAttribute('class', `point ${p.class === 0 ? 'class-a' : 'class-b'}`);
        svg.appendChild(circle);
    });
}

function getDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function runKnn(newPoint) {
    if (isAnimating) return;
    isAnimating = true;
    renderPoints(); // Clean the board of previous animations

    // --- STEP 1: Add the new point and ensure it renders as GREY first ---
    updateExplanation("1. A new point (grey) has been added. We need to predict its class.");
    const newPointCircle = document.createElementNS(svgNS, 'circle');
    newPointCircle.setAttribute('cx', newPoint.x);
    newPointCircle.setAttribute('cy', newPoint.y);
    newPointCircle.setAttribute('r', 10);
    newPointCircle.setAttribute('class', 'new-point'); // This makes it grey
    svg.appendChild(newPointCircle);

    // *** THE CRITICAL FIX IS HERE ***
    // Use a zero-delay setTimeout to force the browser to render the grey point
    // before starting the animation chain.
    setTimeout(() => {
        // --- STEP 2: Find the nearest neighbors ---
        updateExplanation(`2. Finding the ${kValueInput.value} nearest neighbors...`);
        const k = parseInt(kValueInput.value, 10);
        const distances = points.map(p => ({ ...p, distance: getDistance(newPoint, p) }));
        distances.sort((a, b) => a.distance - b.distance);
        const neighbors = distances.slice(0, k);

        // Draw lines to the neighbors
        neighbors.forEach(neighbor => {
            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', newPoint.x);
            line.setAttribute('y1', newPoint.y);
            line.setAttribute('x2', neighbor.x);
            line.setAttribute('y2', neighbor.y);
            line.setAttribute('class', 'neighbor-line');
            svg.appendChild(line);
        });

        setTimeout(() => {
            // --- STEP 3: "Vote" on the class ---
            const classCounts = neighbors.reduce((acc, n) => ({...acc, [n.class]: (acc[n.class] || 0) + 1}), {});
            const countA = classCounts[0] || 0;
            const countB = classCounts[1] || 0;
            updateExplanation(`3. The ${k} neighbors are "voting". Blue votes: ${countA}, Red votes: ${countB}.`);

            setTimeout(() => {
                // --- STEP 4: Classify the point ---
                let winningClass = countA > countB ? 0 : 1;
                if (countA === countB) {
                    winningClass = neighbors[0].class;
                }
                const winningClassName = winningClass === 0 ? 'Blue (Class A)' : 'Red (Class B)';
                updateExplanation(`4. The majority class is ${winningClassName}. The new point is now classified!`);

                // Change the color of the grey point
                newPointCircle.setAttribute('class', `point ${winningClass === 0 ? 'class-a' : 'class-b'}`);
                
                newPoint.class = winningClass;

                setTimeout(() => {
                    // --- FINAL STEP: Add to dataset and reset for next click ---
                    points.push(newPoint);
                    renderPoints();
                    updateExplanation(initialExplanation);
                    isAnimating = false;
                }, 3000);

            }, 3000);

        }, 2500);

    }, 0); // This zero-delay is the key to the fix!
}

// --- Event Listeners ---
svg.addEventListener('click', (event) => {
    const rect = svg.getBoundingClientRect();
    const newPoint = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    runKnn(newPoint);
});

resetButton.addEventListener('click', initializeData);

// Initial setup
// Use a small timeout to ensure SVG has dimensions before drawing.
setTimeout(() => {
    initializeData();
}, 100);

window.addEventListener('resize', initializeData);
