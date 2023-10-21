import Vue from 'vue'
import Router from 'vue-router'
import auth from '../api/auth'

Vue.use(Router)

const pageTitle = 'Compliance Tool'



const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home'),
      title: 'test',
      meta: {
        title: `Home - ${pageTitle}`,
        requiresAuth: true,
        roles: ['user']
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login'),
      meta: {
        title: `Sign In - ${pageTitle}`,
        requiresAuth: false
      }
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: () => import('../views/Unauthorized'),
      meta: {
        title: `Unauthorized Access - ${pageTitle}`,
        requiresAuth: false
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/Admin/Home'),
      meta: {
        title: `Admin Home (Admin) - ${pageTitle}`,
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: '/admin/companies',
      name: 'companies',
      component: () => import('../views/Admin/Company'),
      meta: {
        title: `Companies (Admin) - ${pageTitle}`,
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: '/admin/areas',
      name: 'areas',
      component: () => import('../views/Admin/Areas'),
      meta: {
        title: `Areas (Admin) - ${pageTitle}`,
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: '/admin/controlinplace',
      name: 'controlinplace',
      component: () => import('../views/Admin/ControlInPlace'),
      meta: {
        title: `Controls In Place (Admin) - ${pageTitle}`,
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: '/admin/controlstatus',
      name: 'controlstatus',
      component: () => import('../views/Admin/ControlStatus'),
      meta: {
        title: `Control Status (Admin) - ${pageTitle}`,
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: '/admin/regulations',
      name: 'regulations',
      component: () => import('../views/Admin/Regulations'),
      meta: {
        title: `Regulations (Admin) - ${pageTitle}`,
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: '/admin/risks',
      name: 'risks',
      component: () => import('../views/Admin/Risks'),
      meta: {
        title: `Risks (Admin) - ${pageTitle}`,
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: '/admin/sections',
      name: 'sections',
      component: () => import('../views/Admin/Sections'),
      meta: {
        title: `Sections (Admin) - ${pageTitle}`,
        requiresAuth: true,
        roles: ['admin']
      }
    },
    {
      path: '/print',
      name: 'print',
      component: () => import('../views/Print'),
      meta: {
        title: `Print - ${pageTitle}`,
        requiresAuth: true,
        roles: ['user']
      }
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('../views/Report'),
      meta: {
        title: `Report - ${pageTitle}`,
        requiresAuth: true,
        roles: ['user']
      }
    },
    {
      path: '/printreport',
      name: 'printreport',
      component: () => import('../views/PrintReport'),
      meta: {
        title: `Home - ${pageTitle}`,
        requiresAuth: true,
        roles: ['user']
      }
    },
    {
      path: '/*',
      name: 'not-found',
      component: () => import('../views/NotFound'),
      meta: {
        title: `404 Not Found - ${pageTitle}`,
        requiresAuth: false
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  if(!to.meta.requiresAuth) {
    next()
  }
  else if((to.meta.requiresAuth && !auth.isLoggedIn())) {

    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    let authorized = false

    if (to.meta.roles) {
      to.meta.roles.forEach(role => {
        if(auth.user.roles.includes(role))
          authorized = true
      });

      if(!authorized)
        next({
          path: '/unauthorized',
          query: { redirect: to.fullPath }
        })
      else
        next()
    }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title;
});

export default router