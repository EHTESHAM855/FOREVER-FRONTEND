<template>
    <div class="admin-dashboard">
        <AdminSidebar />
        <main class="admin-main-content">
            <!-- Section for Root Admins -->
            <div v-if="isRootAdmin" class="details-section create-admin-card">
                <div class="create-admin-card">
                    <h2 class="section-title">Create New Admin</h2>
                    <form @submit.prevent="createAdmin" class="admin-form">
                        <div class="form-group">
                            <label for="new-username">Username</label>
                            <input type="text" id="new-username" v-model="newAdmin.username"
                                placeholder="Enter Username for New-Admin" required />
                        </div>
                        <div class="form-group">
                            <label for="new-first_name">First Name</label>
                            <input type="text" id="new-first_name" v-model="newAdmin.first_name"
                                placeholder="First Name of New-Admin" required />
                        </div>
                        <div class="form-group">
                            <label for="new-last_name">Last Name</label>
                            <input type="text" id="new-last_name" v-model="newAdmin.last_name"
                                placeholder="Last Name of New-Admin" required />
                        </div>
                        <div class="form-group">
                            <label for="new-email">Email</label>
                            <input type="email" id="new-email" v-model="newAdmin.email" placeholder="Email of New-Admin"
                                required />
                        </div>
                        <div class="form-group">
                            <label for="new-password">Password</label>
                            <input type="password" id="new-password" v-model="newAdmin.password"
                                placeholder="Password For Login" required />
                        </div>
                        <div class="form-group">
                            <label for="confirm-password">Confirm Password</label>
                            <input type="password" id="confirm-password" placeholder="Re-enter password" />
                        </div>

                        <button class="btn-submit" type="submit">Create Admin</button>
                    </form>
                </div>

            </div>


            <!-- Section for Non-Root Admins -->
            <div v-else class="warning-section">
                <h2 class="warning-title">Access Denied</h2>
                <p class="warning-message">You do not have root admin privileges to access this section.</p>
            </div>
        </main>
    </div>
</template>


<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCsrfToken } from '@/utils/csrf';
import { useAlertStore } from '@/stores/alert';
import { useConfirmStore } from '@/stores/confirm'

const confirm = useConfirmStore()

const BACKEND_BASE = import.meta.env.VITE_API_URL
const router = useRouter();
const alert = useAlertStore();

// Admin data and settings
const isRootAdmin = ref(null);
const newAdmin = ref({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
});
const adminDetails = ref({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    isRootAdmin: false
});

// Function to check if current user is a root admin
const checkIfRootAdmin = async () => {
    try {
        const res = await fetch(`${BACKEND_BASE}/api/check-admin-session`, {
            credentials: 'include',
        });
        if (res.ok) {
            const data = await res.json();
            if (data.isRootAdmin) {
                isRootAdmin.value = data.isRootAdmin;
            }
        } else {
            const data = await res.json().catch(() => null);
            alert.show(data?.message || `Failed to check admin session: ${res.status}`, 'error');
            router.push('/admin/login');
        }
    } catch (err) {
        console.error('Error checking root admin status:', err);
        alert.show(err.message || 'Error checking root admin status', 'error');
        router.push('/admin/login');
    }
};

// Fetch current admin details for editing
const fetchAdminDetails = async () => {
    try {
        const res = await fetch(`${BACKEND_BASE}/api/admin-details`, {
            credentials: 'include',
        });
        if (res.ok) {
            const data = await res.json();
            adminDetails.value = data;
        } else {
            const data = await res.json().catch(() => null);
            alert.show(data?.message || 'Failed to fetch admin details', 'error');
            router.push('/admin/login');
        }
    } catch (err) {
        console.error('Error fetching admin details:', err);
        alert.show(err.message || 'Error fetching admin details', 'error');
        router.push('/admin/login');
    }
};

const createAdmin = async () => {
    const confirmed = await confirm.show("Are you sure to creat this admin?")
    if (confirmed) {
        const csrfToken = await fetchCsrfToken();
        try {
            const res = await fetch(`${BACKEND_BASE}/api/create-admin`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(newAdmin.value),
            });
            if (res.ok) {
                alert.show('New admin created successfully!', 'success');
                newAdmin.value = { username: '', email: '', password: '', first_name: '', last_name: '' };
            } else {
                const data = await res.json().catch(() => null);
                alert.show(data?.message || 'Failed to create admin', 'error');
            }
        } catch (err) {
            console.error('Error creating new admin:', err);
            alert.show(err.message || 'Error creating admin', 'error');
        }
    }
};

onMounted(() => {
    checkIfRootAdmin(); // Check if the logged-in admin is root admin
    fetchAdminDetails(); // Fetch the current logged-in admin details for editing
});
</script>


<style scoped>
.admin-dashboard {
    display: flex;
    height: 100vh;
    margin-left: 65px;
    background-color: #ffffff;
}

.admin-main-content {
    flex: 1;
    padding: 40px;
    background-color: #ffffff;
    border-radius: 8px;
    overflow-y: auto;
}


h1 {
    color: #2c3e50;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 30px;
}

h2.section-title {
    color: #2c3e50;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
}


.details-section,
.create-admin-card,
.warning-section {
    background-color: #ffffff;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;
}

.warning-section {
    background-color: #fff3f3;
    border: 1px solid #f5c6cb;
    color: #c0392b;
    text-align: center;
}

.warning-title {
    font-size: 22px;
    margin-bottom: 10px;
}

.warning-message {
    font-size: 16px;
}

.admin-form {
    display: flex;
    flex-direction: column;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-weight: 600;
    margin-bottom: 6px;
    font-size: 14px;
    color: #2c3e50;
}

.form-group input {
    padding: 12px 14px;
    font-size: 15px;
    border: 1px solid #ccd6dd;
    border-radius: 6px;
    background-color: #fdfdfd;
    transition: border-color 0.2s ease, background-color 0.2s ease;
}

.form-group input:focus {
    border-color: #3498db;
    background-color: #f0f9ff;
    outline: none;
}

.form-group.full-width {
    grid-column: span 2;
}

.btn-submit {
    grid-column: span 2;
    max-width: 100%;
    width: 100%;
    padding: 12px 20px;
    background: linear-gradient(to right, #6c5ce7, #a29bfe);
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-submit:hover {
    background: linear-gradient(to right, #5e54c7, #8e85f2);

}

@media (max-width: 640px) {
    .admin-main-content {
        padding: 20px;
    }

    .menu {
        flex-direction: column;
    }

    .form-group.full-width,
    .btn-submit {
        grid-column: span 1;
        width: 100%;
        max-width: 100%;
    }

    .btn-submit {
        justify-self: center;
    }
}
</style>
