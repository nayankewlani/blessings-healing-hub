function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.currentTarget.classList.add('active');
}
document.addEventListener('DOMContentLoaded', () => {
    loadLeads();
    loadAdminStats();
    
    document.getElementById('course-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        alert('Course added!');
        e.target.reset();
    });
    document.getElementById('stats-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        // Convert to numbers
        data.yearsInOperation = Number(data.yearsInOperation);
        data.practitionersTrained = Number(data.practitionersTrained);
        data.livesTouched = Number(data.livesTouched);
        await fetch('/api/stats', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        alert('Stats updated!');
    });
});
async function loadLeads() {
    const res = await fetch('/api/leads');
    const leads = await res.json();
    const tbody = document.querySelector('#leads-table tbody');
    tbody.innerHTML = leads.map(l => `
        <tr>
            <td>${l.name}</td>
            <td>${l.email}</td>
            <td>${l.message}</td>
            <td>${l.status}</td>
        </tr>
    `).join('');
}
async function loadAdminStats() {
    const res = await fetch('/api/stats');
    const stats = await res.json();
    if (stats) {
        const form = document.getElementById('stats-form');
        form.elements.yearsInOperation.value = stats.yearsInOperation;
        form.elements.practitionersTrained.value = stats.practitionersTrained;
        form.elements.livesTouched.value = stats.livesTouched;
    }
}