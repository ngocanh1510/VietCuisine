import { FundFilled } from '@ant-design/icons';
import { AdminRouterItem } from "../../../router";
import Showtimes from '.';

const demoRoutes: AdminRouterItem[] = [
  {
    path: 'admin/user',
    element: <Showtimes/>,
    meta: {
      label: "Quản lý người dùng",
      title: "Quản lý người dùng",
      key: "admin/user",
      icon: <FundFilled />,
    },
    
  }
]

export default demoRoutes
