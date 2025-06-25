import { UnorderedListOutlined, VideoCameraAddOutlined } from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import { AdminRouterItem } from '../../../router';
import IngredientForm from "./components/addIngredient";
import DemoTable from "./components/listIngredient";
import { faCarrot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FormatListBulletedAddIcon from '@mui/icons-material/FormatListBulletedAdd';

const demoRoutes: AdminRouterItem[] = [
{
    path: "/admin/ingredient",
    element: <Outlet />,
    meta: {
        label: "Quản lý nguyên liệu",
        title: "Quản lý nguyên liệu",
        key: "/admin/ingredient",
        icon: <FontAwesomeIcon icon={faCarrot} />
    },
    children: [
    {
        path: "listIngredient",
        element: <DemoTable/>,
        meta: {
            label: "Danh sách nguyên liệu",
            title: "Danh sách phim",
            key: "/admin/ingredient/listIngredient",
            icon: <UnorderedListOutlined />,
        },
    },
    {
        path: "addIngredient",
        element: <IngredientForm/>,
        meta: {
            label: "Thêm nguyên liệu",
            title: "Thêm nguyên liệu",
            key: "/admin/ingredient/addIngredient",
            icon: <FormatListBulletedAddIcon style={{ fontSize: 17 }} />
        },
    }
    ],
},
];

export default demoRoutes;
