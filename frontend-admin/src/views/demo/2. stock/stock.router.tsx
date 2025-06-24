import { PlaySquareTwoTone, UnorderedListOutlined, VideoCameraAddOutlined } from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import { AdminRouterItem } from '../../../router';
import DemoTable from "./components/listIngredientInStock";
import InventoryTable from "./components/updateQuantity";

const demoRoutes: AdminRouterItem[] = [
{
    path: "admin/stock",
    element: <Outlet />,
    meta: {
        label: "Quản lý kho",
        title: "Quản lý kho",
        key: "admin/stock",
        icon: <PlaySquareTwoTone/>,
    },
    children: [
    {
        path: "ingredient",
        element: <DemoTable/>,
        meta: {
            label: "Tổng hợp kho",
            title: "Tổng hợp kho",
            key: "/admin/stock/ingredient",
            icon: <UnorderedListOutlined/>,
        },
    },
    {
        path: "updateQuantity",
        element: <InventoryTable/>,
        meta: {
            label: "Nhập kho",
            title: "Nhập kho",
            key: "/admin/stock/updateQuantity",
            icon: <VideoCameraAddOutlined/>,
        },
    }
    ],
},
];

export default demoRoutes;
