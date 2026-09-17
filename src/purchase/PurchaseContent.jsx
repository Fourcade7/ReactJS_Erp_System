import { ArrowDownLeft } from 'lucide-react'
import TransactionWorkspace from '../transaction/TransactionWorkspace'
import {
  addNewPayment,
  addNewPurchase,
  getAllCustomersForSale,
  getAllProductPaginationSearch,
  getAllPurchaseListPaginationSearch,
} from './PurchaseApi'

const PURCHASE_CONFIG = {
  Icon: ArrowDownLeft,
  title: 'Приход',
  description: 'Поступление товаров от поставщиков на склад',
  label: 'Приход',
  listTitle: 'Список приходов',
  newTitle: 'Новый приход',
  detailTitle: 'Детали прихода',
  checkoutTitle: 'Оформление прихода',
  tone: 'info',
  priceField: 'price',
  limitByStock: false,
  onlyStocked: true,
  autoAddSingle: false,
  printable: false,
  fetchPage: getAllPurchaseListPaginationSearch,
  fetchProducts: getAllProductPaginationSearch,
  fetchCustomers: getAllCustomersForSale,
  submit: addNewPurchase,
  addNewPayment,
}

function PurchaseScreen() {
  return <TransactionWorkspace config={PURCHASE_CONFIG} />
}

export default PurchaseScreen
