
import { AdminRouterItem } from "../../../router";
import { MdArticle } from 'react-icons/md'; // icon biểu tượng "thêm bài viết"
import PostManagement from './postManage';

const demoRoutes: AdminRouterItem[] = [
  {
    path: 'admin/post',
    element: <PostManagement/>,
    meta: {
      label: "Quản lý bài viết",
      title: "Quản lý bài viết",
      key: "admin/post",
      icon: <MdArticle />
    },
    
  }
]

export default demoRoutes
