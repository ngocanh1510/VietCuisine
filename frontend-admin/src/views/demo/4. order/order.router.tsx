import { Outlet } from "react-router-dom";
import { AdminRouterItem } from "../../../router";
import OrderList from './component/orderList';
import { IoReceiptSharp } from 'react-icons/io5'; // receipt-sharp nằm trong `io5`
import {  UnorderedListOutlined } from "@ant-design/icons";
import OrderDetail from "./component/orderDetail";

const demoRoutes: AdminRouterItem[] = [
  {
  path: 'admin/order',
  element: <OrderList/>,
  meta: {
    label: "Quản lý đơn hàng",
    title: "Quản lý đơn hàng",
    key: "admin/order",
    icon: <IoReceiptSharp />
  },
//   children: [
//     {
//       path: 'orderList',
//       element: <OrderList/>,
//       meta: {
//         label: "Danh sách đơn hàng",
//         title: "Danh sách đơn hàng",
//         key: "/admin/order/orderList",
//         icon: <UnorderedListOutlined />,
//       },
//     },
//     {
//       path: 'orderList/:id', // 👈 tránh dùng '/:id' vì nó trùng với cha
//       element: <OrderDetail />,
//     }
//   ],
}
];
export default demoRoutes
