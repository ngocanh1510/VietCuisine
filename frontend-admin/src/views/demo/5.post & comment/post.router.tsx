
import { AdminRouterItem } from "../../../router";
import { MdArticle } from 'react-icons/md'; // icon biểu tượng "thêm bài viết"
import PostManagement from './component/postManage';
import { Outlet } from "react-router-dom";
import ReportManagement from "./component/reportManager";
import ReportIcon from '@mui/icons-material/Report';

const demoRoutes: AdminRouterItem[] = [
  {
    path: 'admin/post',
    element: <Outlet/>,
    meta: {
      label: "Quản lý bài viết",
      title: "Quản lý bài viết",
      key: "admin/post",
      icon: <MdArticle />
    },
   children: [
       {
           path: "postList",
           element: <PostManagement/>,
           meta: {
               label: "Danh sách bài viết",
               title: "Danh sách bài viết",
               key: "/admin/post/postList",
               icon: <MdArticle />,
           },
       },
       {
           path: "reportList",
           element: <ReportManagement/>,
           meta: {
               label: "Danh sách báo cáo",
               title: "Danh sách báo cáo",
               key: "/admin/post/reportList",
               icon: <ReportIcon style={{ color: "red", marginRight: 8 }} />
           },
       }
       ],
   },
   ];
   

export default demoRoutes
