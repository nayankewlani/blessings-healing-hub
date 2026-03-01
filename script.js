document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadCourses();
    const leadForm = document.getElementById('lead-form');
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(leadForm);
        const data = Object.fromEntries(formData.entries());
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                alert('Message sent successfully!');
                leadForm.reset();
            }
        } catch (err) {
            console.error(err);
        }
    });
});
async function loadStats() {
    try {
        const res = await fetch('/api/stats');
        const stats = await res.json();
        if (stats) {
            document.getElementById('stat-years').textContent = stats.yearsInOperation + '+';
            document.getElementById('stat-trained').textContent = stats.practitionersTrained + '+';
            document.getElementById('stat-lives').textContent = Math.floor(stats.livesTouched / 1000) + 'k+';
        }
    } catch (err) {
        console.error(err);
    }
}
async function loadCourses() {
    try {
        const res = await fetch('/api/courses');
        const courses = await res.json();
        const grid = document.getElementById('courses-grid');
        grid.innerHTML = courses.map(course => `
            <div class="course-card">
                <img src="${course.imageUrl || 'https://via.placeholder.com/400x300'}" alt="${course.title}">
                <div class="course-content">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <div style="margin-top: 1rem; font-size: 0.8rem; color: #64748b;">
                        <span>${course.duration || ''}</span> • <span>${course.price || ''}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}