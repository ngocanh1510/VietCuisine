import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { AdminRouterItem } from "../../../router";
import UserList from '.';

const demoRoutes: AdminRouterItem[] = [
  {
    path: 'admin/user',
    element: <UserList/>,
    meta: {
      label: "Quản lý người dùng",
      title: "Quản lý người dùng",
      key: "admin/user",
      icon: <FontAwesomeIcon icon={faUser}  />
    },
    
  }
]

export default demoRoutes
