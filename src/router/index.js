import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Order from '../views/Order.vue'
import Drivers from '../views/Drivers.vue'
import Stat from '../views/Stat.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Main',
    icon: 'source',
    text: 'Заказы',
    show: true,
    component: Home
  },
  {
    path: '/order/:id',
    name: 'Order',
    show: false,
    component: Order
  },
  {
    path: '/drivers',
    name: 'Drivers',
    source: 'drive_eta',
    show: true,
    text: 'Водители',
    component: Drivers
  },
  {
    path: '/stat',
    name: 'Stat',
    show: true,
    text: 'Статистика',
    component: Stat
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
