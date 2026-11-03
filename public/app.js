const API = '/api';

    async function readApiResponse(res) {
      if (!(res.headers.get('content-type') || '').includes('application/json')) {
        await res.text();
        throw new Error(`The server returned an unexpected response (${res.status}). Check the deployment configuration.`);
      }

      return res.json();
    }

    function getToken() { return localStorage.getItem('token'); }
    function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }; }

    // ---- REGISTER PAGE ----
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
        };
        const msg = document.getElementById('msg');
        try {
          const res = await fetch(`${API}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          });
          const result = await readApiResponse(res);
          msg.textContent = result.message || result.error;
          if (result.success) window.location.href = 'login.html';
        } catch (error) {
          msg.textContent = error.message;
        }
      });
    }

    // ---- LOGIN PAGE ----
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
        };
        const msg = document.getElementById('msg');
        try {
          const res = await fetch(`${API}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          });
          const result = await readApiResponse(res);
          if (!res.ok || !result.success) { msg.textContent = result.error || 'Login failed'; return; }
          localStorage.setItem('token', result.token); // store JWT for future requests
          window.location.href = 'dashboard.html';
        } catch (error) {
          msg.textContent = error.message;
        }
      });
    }

    // ---- DASHBOARD PAGE ----
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
      if (!getToken()) window.location.href = 'login.html'; // guard: must be logged in

      
async function loadTasks() {
  try {
    const res = await fetch(`${API}/tasks`, {
      headers: authHeaders()
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to load tasks');
    }

    const list = document.getElementById('taskList');
    list.replaceChildren();

    result.data.forEach((task) => {
      const li = document.createElement('li');
      li.className = task.completed ? 'done' : '';

      // Task title and priority
      const span = document.createElement('span');
      span.textContent = `${task.title} `;

      const em = document.createElement('em');
      em.textContent = `(${task.priority})`;
      span.appendChild(em);

      // Buttons container
      const div = document.createElement('div');

      // Done / Undo button
      const updateBtn = document.createElement('button');
      updateBtn.textContent = task.completed ? 'Undo' : 'Done';

      updateBtn.addEventListener('click', async () => {
        updateBtn.disabled = true;

        try {
          const updateRes = await fetch(`${API}/tasks/${task._id}`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({
              completed: !task.completed
            })
          });

          const updateResult = await updateRes.json();

          if (!updateRes.ok || !updateResult.success) {
            throw new Error(
              updateResult.error || 'Failed to update task'
            );
          }

          await loadTasks();
        } catch (error) {
          alert(error.message);
          updateBtn.disabled = false;
        }
      });

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'delete';

      deleteBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this task?')) {
          return;
        }

        deleteBtn.disabled = true;

        try {
          const deleteRes = await fetch(`${API}/tasks/${task._id}`, {
            method: 'DELETE',
            headers: authHeaders()
          });

          const deleteResult = await deleteRes.json();

          if (!deleteRes.ok || !deleteResult.success) {
            throw new Error(
              deleteResult.error || 'Failed to delete task'
            );
          }

          await loadTasks();
        } catch (error) {
          alert(error.message);
          deleteBtn.disabled = false;
        }
      });

      // Add elements to the task
      div.appendChild(updateBtn);
      div.appendChild(deleteBtn);

      li.appendChild(span);
      li.appendChild(div);

      list.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}


      taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          title: document.getElementById('title').value,
          priority: document.getElementById('priority').value,
        };
        await fetch(`${API}/tasks`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
        taskForm.reset();
        loadTasks();
      });

      window.toggleTask = async (id, completed) => {
        await fetch(`${API}/tasks/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ completed }) });
        loadTasks();
      };

      window.deleteTask = async (id) => {
        await fetch(`${API}/tasks/${id}`, { method: 'DELETE', headers: authHeaders() });
        loadTasks();
      };

      document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
      });

      loadTasks();
    }