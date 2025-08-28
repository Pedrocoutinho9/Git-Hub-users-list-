const userList = document.querySelector('.user-list');
const userDetails = document.getElementById('userDetails');
const searchInput = document.getElementById('search');
const loadMoreBtn = document.getElementById('loadMore');
const listError = document.getElementById('listError');
const detailsError = document.getElementById('detailsError');

let since = 0;
let debounceTimeout;
let currentQuery = '';

async function fetchJSON(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return await res.json();
    } catch (err) {
        throw err;
    }
}

function renderUsers(users, append = false) {
    if (!append) userList.innerHTML = '';
    users.forEach((user, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${user.avatar_url}" alt="${user.login}"><span>${user.login}</span>`;
        li.addEventListener('click', () => showUserDetails(user.login));
        userList.appendChild(li);
        setTimeout(() => li.classList.add('visible'), index * 100);
    });
}

async function loadUsers() {
    listError.textContent = '';
    try {
        const url = currentQuery
            ? `https://api.github.com/search/users?q=${currentQuery}&per_page=30`
            : `https://api.github.com/users?since=${since}&per_page=30`;
        const data = await fetchJSON(url);
        const users = currentQuery ? data.items : data;
        renderUsers(users, since !== 0);
        if (!currentQuery && users.length) {
            since = users[users.length - 1].id;
        }
    } catch (err) {
        listError.textContent = err.message;
    }
}

async function showUserDetails(username) {
    detailsError.textContent = '';
    userDetails.innerHTML = 'Loading...';
    try {
        const data = await fetchJSON(`https://api.github.com/users/${username}`);
        userDetails.innerHTML = `
        <img src="${data.avatar_url}" alt="${data.login}">
        <h2>${data.name || 'N/A'}</h2>
        <p><strong>Username:</strong> ${data.login}</p>
        <p><strong>Bio:</strong> ${data.bio || 'N/A'}</p>
        <p><strong>Location:</strong> ${data.location || 'N/A'}</p>
        <p><strong>Company:</strong> ${data.company || 'N/A'}</p>
        <p><strong>Followers:</strong> ${data.followers}</p>
        <p><strong>Following:</strong> ${data.following}</p>
        <p><strong>Public Repos:</strong> ${data.public_repos}</p>
        <a href="${data.html_url}" target="_blank">Visit GitHub Profile</a>
      `;
    } catch (err) {
        userDetails.innerHTML = '';
        detailsError.textContent = err.message;
    }
}

searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        currentQuery = searchInput.value.trim();
        since = 0;
        loadUsers();
    }, 500);
});

loadMoreBtn.addEventListener('click', () => {
    if (!currentQuery) loadUsers();
});

loadUsers();
