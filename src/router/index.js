import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Order from '../views/Order.vue'
import Drivers from '../views/Drivers.vue'
import Stat from '../views/Stat.vue'
import Doc from '../views/Doc.vue'
import AddOrder from '../views/AddOrder.vue'
import Parking from '../views/Parking.vue'
import CityPrice from '../views/CityPrice.vue'
import Account from '../views/Account.vue'

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
    path: '/doc',
    name: 'Doc',
    source: 'file-text',
    show: true,
    text: 'Документы',
    component: Doc
  },
  {
    path: '/parking',
    name: 'Parking',
    source: 'file-text',
    show: true,
    text: 'Стоянки',
    component: Parking
  },
  {
    path: '/city-price',
    name: 'CityPrice',
    source: 'file-text',
    show: true,
    text: 'Стоимость доставки',
    component: CityPrice
  },
  {
    path: '/account',
    name: 'Account',
    source: 'file-text',
    show: true,
    text: 'Мой Аккаунт',
    component: Account
  },
  {
    path: '/addorder',
    name: 'AddOrder',
    source: 'file-text',
    show: true,
    text: 'Добавить заявку',
    component: AddOrder
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
