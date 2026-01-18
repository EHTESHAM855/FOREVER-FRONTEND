import { createRouter, createWebHistory } from 'vue-router'

// General Views
import HomeView from '@/views/HomeView.vue'
import FeaturesView from '@/views/FeaturesView.vue'
import PricingView from '@/views/PricingView.vue'
import ContactView from '@/views/ContactView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/user/LoginView.vue'
import TemplateView from '@/views/TemplateView.vue'
import TemplateDetail from '@/views/TemplateDetail.vue'

// Template Preview & Edit
import TemplatePreview from '@/views/template/TemplatePreview.vue'
import Customize from '@/views/template/CustomizeView.vue'
import EditedTemplatePreview from '@/views/template/EditedTemplatePreview.vue'
import Customize_EditedView from '@/views/template/Customize_EditedView.vue'
import PublishView from '@/views/template/PublishView.vue'
import Extend_timelineView from '@/views/template/extend_timelineView.vue'

// Published Page
import published from '@/views/published.vue'
import ExpiredPage from '@/components/ExpiredPage.vue'

// User Dashboard Layout and Views
import UserView from '@/views/user/UserView.vue'
import OverviewView from '@/views/user/OverviewView.vue'
import TemplatesUView from '@/views/user/TemplatesUView.vue'
import dashboard_user_templates from '@/views/user/user_templates.vue'
import PublishedView from '@/views/user/PublishedView.vue'
import User_Profile from '@/views/user/User_Profile.vue'
import User_profile_update from '@/views/user/user_profile_update.vue'

import UserTransactions from '@/views/user/UserTransactions.vue'
import UploadView from '@/views/user/UploadView.vue'

// Admin Views
import AdminView from '@/views/admin/AdminView.vue'
import AdminLogin from '@/views/admin/AdminLogin.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminUser from '@/views/admin/AdminUser.vue'
import AdminTemplate from '@/views/admin/AdminTemplate.vue'
import AdminContact from '@/views/admin/AdminContact.vue'
import AdminReport from '@/views/admin/AdminReport.vue'
import AdminPublished from '@/views/admin/AdminPublished.vue'
import AdminProfile from '@/views/admin/AdminProfile.vue'
import AdminEditeProfile from '@/views/admin/AdminEditeProfile.vue'
import AdminCreateAdmin from '@/views/admin/AdminCreateAdmin.vue'
import AdminTransactions from '@/views/admin/AdminTransactions.vue'
import VerifyAccount from '@/views/user/VerifyAccount.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 🌐 Public Routes
    { path: '/', name: 'home', component: HomeView },
    { path: '/features', name: 'features', component: FeaturesView, meta: { navName: 'features' } },
    { path: '/pricing', name: 'pricing', component: PricingView, meta: { navName: 'pricing' } },
    { path: '/contact', name: 'contact', component: ContactView, meta: { navName: 'contact' } },
    { path: '/register', name: 'Register', component: RegisterView, meta: { navName: 'register' } },
    { path: '/login', name: 'Login', component: LoginView, meta: { navName: 'login' } },
    { path: '/template', name: 'template', component: TemplateView, meta: { navName: 'template' } },
    { path: '/template/:template_id', name: 'TemplateDetails', component: TemplateDetail },

    // 🖼️ Template Actions
    {
      path: '/TemplatePreview/:name',
      name: 'TemplatePreview',
      component: TemplatePreview,
      meta: { hideLayout: true },
      props: true,
    },
    {
      path: '/customize/:name',
      name: 'Customize',
      component: Customize,
      meta: { hideLayout: true },
      props: true,
    },

    // 👤 User Dashboard Layout
    {
      path: '/dashboard',
      component: UserView,
      meta:{dashboard:true},
      children: [
        { path: '', name: 'UserOverview', component: OverviewView },
        { path: 'templates', name: 'TemplatesU', component: TemplatesUView },
        { path: 'myTemplates', name: 'myTemplates', component: dashboard_user_templates },
        {
          path: 'myTemplates/publish/:editedtemplate_id',
          name: 'TemplatePublish',
          component: PublishView,
        },
        {
          path: 'PublishedTemplates/ExtendTimeline/:publishedtemplate_id',
          name: 'ExtendTimeline',
          component: Extend_timelineView,
        },
        { path: 'published', name: 'PublishedPages', component: PublishedView },
        { path: 'transactions', name: 'Transactions', component: UserTransactions },
        { path: 'profile', name: 'UserProfile', component: User_Profile },
        { path: 'profile/edit', name: 'UserProfileEdit', component: User_profile_update },
        {
          path: 'uploads',
          name: 'Uploads',
          component: UploadView,
        },
      ],
    },

    // ✨ Edited Templates
    {
      path: '/dashboard/myTemplates/:edited_template_id',
      name: 'EditedTemplatePreview',
      component: EditedTemplatePreview,
      meta: { hideLayout: true },
    },
    {
      path: '/dashboard/myTemplates/customize/:editedtemplate_id',
      name: 'EditedTemplateCustomize',
      component: Customize_EditedView,
      meta: { hideLayout: true },
    },

    // 🛠️ Admin Routes
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: AdminDashboard,
      meta: { hideLayout: true },
    },
    { path: '/admin/login', name: 'AdminLogin', component: AdminLogin },
    { path: '/admin/users', name: 'AdminUser', component: AdminUser, meta: { hideLayout: true } },
    {
      path: '/admin/template_upload',
      name: 'AdminTemplateUpload',
      component: AdminView,
      meta: { hideLayout: true },
      props: true,
    },
    {
      path: '/admin/templates',
      name: 'AdminTemplates',
      component: AdminTemplate,
      meta: { hideLayout: true },
    },
    {
      path: '/admin/contacts',
      name: 'AdminContacts',
      component: AdminContact,
      meta: { hideLayout: true },
    },
    {
      path: '/admin/feedbacks',
      name: 'AdminReports',
      component: AdminReport,
      meta: { hideLayout: true },
    },
    {
      path: '/admin/published-pages',
      name: 'AdminPublished',
      component: AdminPublished,
      meta: { hideLayout: true },
    },
    {
      path: '/admin/profile',
      name: 'AdminProfile',
      component: AdminProfile,
      meta: { hideLayout: true },
    },
    {
      path: '/admin/settings/editProfile',
      name: 'AdminEditProfile',
      component: AdminEditeProfile,
      meta: { hideLayout: true },
    },
    {
      path: '/admin/settings/createAdmin',
      name: 'CreateAdmin',
      component: AdminCreateAdmin,
      meta: { hideLayout: true },
    },
    {
      path: '/admin/transactions',
      name: 'AdminTransactions',
      component: AdminTransactions,
      meta: { hideLayout: true },
    },

    // 🌍 Published Pages
    {
      path: '/p/:username/:name',
      name: 'Published',
      component: published,
      meta: { hideLayout: true },
    },
    { path: '/expired', name: 'ExpiredPage', component: ExpiredPage, meta: { hideLayout: true } },

    // Account Verification
    {
      path:"/verify-email/", name:'AccountVerification', component:VerifyAccount
    },
  ],
})

export default router
