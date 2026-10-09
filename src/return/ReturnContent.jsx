import { Undo2 } from 'lucide-react'
import TransactionWorkspace from '../transaction/TransactionWorkspace'
import {
  addNewPayment,
  addNewReturn,
  getAllCustomersForSale,
  getAllProductPaginationSearch,
  getAllReturnsListPaginationSearch,
} from './ReturnApi'
import { t } from '../i18n'

const RETURN_CONFIG = {
  Icon: Undo2,
  title: t('Возврат'),
  description: t('Возврат товаров от покупателей'),
  label: t('Возврат'),
  listTitle: t('Список возвратов'),
  newTitle: t('Новый возврат'),
  detailTitle: t('Детали возврата'),
  checkoutTitle: t('Оформление возврата'),
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
