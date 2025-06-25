import { Table, Avatar, message, Space, Modal } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { CloseCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3001/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const showBanConfirm = (record: any) => {
    Modal.confirm({
        title: `Bạn có chắc chắn muốn ${record.status === 'banned' ? 'bỏ cấm' : 'cấm'} người dùng "${record.name || record.user?.name}"?`,
        content: `Người dùng này sẽ ${record.status === 'banned' ? 'có thể đăng nhập' : 'không thể đăng nhập'} vào hệ thống.`,
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk() {
            handleToggleBan(record);
        },
        onCancel() {
            console.log("Hủy thao tác ban");
        },
    });
    };

  
  const handleToggleBan = async (user: any) => {
    try {
        await axios.put(`http://localhost:3001/admin/accounts/${user._id}/status`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
        });
        message.success(`Đã ${user.status === 'banned' ? "bỏ cấm" : "cấm"} người dùng`);
        fetchUsers(); // Load lại danh sách người dùng
    } catch (error) {
        console.error("Ban user failed:", error);
        message.error("Không thể cập nhật trạng thái người dùng");
    }
    };


  useEffect(() => {
    fetchUsers();
  }, []);

const columns: ColumnsType<any> = [
  {
    title: <div style={{ textAlign: 'center' }}>Họ tên</div>,
    key: 'name',
    render: (record: any) => record.user?.name || record.name || 'Không rõ',
    },
  {
    title: 'Giới tính',
    key: 'gender',
    render: (record:any) => {
      const gender = record.user?.gender || record.gender;
      return gender === 'male' || gender === 'Nam' ? 'Nam' : 'Nữ';
    },
  },
  {
    title: 'Số điện thoại',
    key: 'phone',
    render: (record:any) => record.user?.phone || record.phone || '---',
  },
  {
    title: <div style={{ textAlign: 'center' }}>Email</div>,
    key: 'email',
    render: (record:any) => record.user?.email || record.email || '---',
  },
  {
    title: <div style={{ textAlign: 'center' }}>Ảnh đại diện</div>,
    key: 'avatar',
    align: 'center' as const,
    render: (record:any) => {
      const avatar = record.user?.avatar || record.avatar;
      return <Avatar src={avatar} />;
    },
  },
  {
    title: <div style={{ textAlign: 'center' }}>Ngày tạo</div>,
    key: 'createdAt',
    render: (record:any) => {
      const date = record.user?.createdAt || record.createdAt;
      return date ? moment(date).format("DD/MM/YYYY HH:mm") : '---';
    },
  },
  {
    title: 'Vai trò',
    key: 'role',
    render: (record:any) => record.user?.role || record.role || 'Người dùng',
  },
  {
    title: 'Trạng thái',
    key: 'status',
    align: 'center' as const,
    render: (record:any) => record.user?.status || record.status || '---',
  },
  {
    title: " ",
    key: "action",
    align: 'center' as const,
    render: (_: any, record: any) => (
        <Space size="middle">
        <CloseCircleOutlined
            style={{ 
                color: record.status === 'banned' ? 'green' : 'red', 
                fontSize: 18, 
                cursor: "pointer" 
            }}
            title={record.status === 'banned' ? "Unban người dùng" : "Ban người dùng"}
            onClick={() => showBanConfirm(record)}
            />

        </Space>
    ),
  }
];


  return (
    <div>
      <h2>Danh sách người dùng</h2>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="_id"
        loading={loading}
        bordered
      />
    </div>
  );
};

export default UserList;
