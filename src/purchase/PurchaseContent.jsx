import { ArrowDownLeft } from 'lucide-react'
import TransactionWorkspace from '../transaction/TransactionWorkspace'
import {
  addNewPayment,
  addNewPurchase,
  getAllCustomersForSale,
  getAllProductPaginationSearch,
  getAllPurchaseListPaginationSearch,
} from './PurchaseApi'
import { t } from '../i18n'

const PURCHASE_CONFIG = {
  Icon: ArrowDownLeft,
  title: t('Приход'),
  description: t('Поступление товаров от поставщиков на склад'),
  label: t('Приход'),
  listTitle: t('Список приходов'),
  newTitle: t('Новый приход'),
  detailTitle: t('Детали прихода'),
  checkoutTitle: t('Оформление прихода'),
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
