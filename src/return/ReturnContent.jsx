import { Undo2 } from 'lucide-react'
import TransactionWorkspace from '../transaction/TransactionWorkspace'
import {
  addNewPayment,
  addNewReturn,
  getAllCustomersForSale,
  getAllProductPaginationSearch,
  getAllReturnsListPaginationSearch,
} from './ReturnApi'

const RETURN_CONFIG = {
  Icon: Undo2,
  title: 'Возврат',
  description: 'Возврат товаров от покупателей',
  label: 'Возврат',
  listTitle: 'Список возвратов',
  newTitle: 'Новый возврат',
  detailTitle: 'Детали возврата',
  checkoutTitle: 'Оформление возврата',
  tone: 'warning',
  priceField: 'buyPrice',
  limitByStock: false,
  onlyStocked: true,
  autoAddSingle: false,
  printable: false,
  fetchPage: getAllReturnsListPaginationSearch,
  fetchProducts: getAllProductPaginationSearch,
  fetchCustomers: getAllCustomersForSale,
  submit: addNewReturn,
  addNewPayment,
}

function ReturnScreen() {
  return <TransactionWorkspace config={RETURN_CONFIG} />
}

export default ReturnScreen
