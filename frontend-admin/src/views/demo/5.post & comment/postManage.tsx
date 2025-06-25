import React, { useEffect, useState } from 'react';
import {
  Table, Space, Button, Tag, DatePicker, Input, message,
  Avatar, Modal, Card, List, Divider, Dropdown, Menu
} from 'antd';
import {
  DeleteOutlined, EllipsisOutlined, EyeOutlined, LikeOutlined
} from "@ant-design/icons";
import moment from "moment";
import Paragraph from 'antd/es/typography/Paragraph';
import Title from 'antd/es/typography/Title';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { Search } = Input;

type Post = {
  _id: string;
  userId?: { name?: string; _id?: string; avatar?: string };
  caption?: string;
  image?: string;
  likes?: any[];
  comments?: any[];
  reported?: boolean;
  createdAt?: string;
  recipeId?: { title?: string };
};

const PostManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (dateRange.length === 2) {
        params.startDate = dateRange[0].startOf('day').toISOString();
        params.endDate = dateRange[1].endOf('day').toISOString();
      }
      if (searchText) {
        params.keyword = searchText;
      }

      const res = await axios.get('http://localhost:3001/posts', {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPosts(res.data);
    } catch (error) {
      message.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [dateRange]);

  const showDeletePostConfirm = (id: string) => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa post không?`,
      content: "Hành động này không thể phục hồi",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        handleDeletePost(id);
      },
      onCancel() {
        console.log("Cancelled delete");
      },
    });
  };

  const handleDeletePost = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3001/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('Đã xoá bài viết');
      setIsModalVisible(false);
      fetchPosts();
    } catch (err) {
      message.error('Xoá thất bại');
    }
  };

  const showDeleteCommentConfirm = (id: string) => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa comment không?`,
      content: "Hành động này không thể phục hồi",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        handleDeleteComment(id);
      },
      onCancel() {
        console.log("Cancelled delete");
      },
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(`http://localhost:3001/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      message.success("Đã xoá bình luận");
      if (selectedPost) viewDetail({ _id: selectedPost._id });
    } catch (err) {
      message.error("Không thể xoá bình luận");
    }
  };

  const viewDetail = async (record: any) => {
    try {
      const res = await axios.get(`http://localhost:3001/posts/${record._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSelectedPost(res.data);
      setIsModalVisible(true);
    } catch (err) {
      message.error("Không thể tải chi tiết bài viết");
    }
  };

  const columns = [
    {
      title: "ID bài viết",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Tên người đăng",
      dataIndex: "userId",
      key: "userId",
      width: 200,
      render: (user: any) => user?.name || user?._id || "Ẩn danh" ,
    },
    {
      title: "Caption",
      dataIndex: "caption",
      key: "caption",
      ellipsis: true,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      align: "center" as const,
      render: (image: string) => (
        <Avatar shape="square" size={64} src={image} />
      ),
    },
    // {
    //   title: "Recipe",
    //   dataIndex: "recipeId",
    //   key: "recipeId",
    //   render: (recipe: any) => recipe?.title || recipe?._id || "Không liên kết",
    // },
    {
      title: "Lượt like",
      dataIndex: "likes",
      key: "likes",
      width:100,
      align: "center" as const,
      render: (likes: any[]) => likes?.length || 0,
    },
    {
      title: "Lượt bình luận",
      dataIndex: "comments",
      key: "comments",
      width:130,
      align: "center" as const,
      render: (comments: any[]) => comments?.length||0,
    },
    {
      title: "Bị báo cáo",
      dataIndex: "reported",
      key: "reported",
      render: (reported: boolean) => (
        <Tag color={reported ? "red" : "green"}>
          {reported ? "Đã báo cáo" : "Bình thường"}
        </Tag>
      ),
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => viewDetail(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => showDeletePostConfirm(record._id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý bài viết</h2>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker onChange={(values) => setDateRange(values || [])} />
      </Space>

      <Table
        columns={columns}
        dataSource={posts}
        rowKey="_id"
        loading={loading}
        bordered
      />

      {/* Modal chi tiết bài viết */}
      <Modal
        open={isModalVisible}
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Chi tiết bài viết</span>
            {/* <DeleteOutlined
              onClick={() => handleDeletePost(selectedPost?._id)}
              style={{ color: "red", cursor: "pointer" }}
              title="Xoá bài viết"
            /> */}
          </div>
        }
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedPost && (
          <Card bordered={false}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              <Avatar src={selectedPost.userId?.avatar} size={48} />
              <div style={{ marginLeft: 12 }}>
                <strong>{selectedPost.userId?.name || "Ẩn danh"}</strong>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {moment(selectedPost.createdAt).fromNow()}
                </div>
              </div>
            </div>
            
            <Title level={4} style={{ marginTop: 16 }}>{selectedPost.caption}</Title>
            {selectedPost.image && (
              <img
                src={selectedPost.image}
                alt="post"
                style={{ width: "90%", maxHeight: 500, objectFit: "cover", borderRadius: 8 }}
              />
            )}

            {selectedPost.recipeId && (
              <Paragraph><strong>Công thức:</strong> {selectedPost.recipeId.title}</Paragraph>
            )}

            <Divider />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><LikeOutlined style={{ color: "#1890ff", marginRight: 6 }} /> {selectedPost.likes?.length || 0} lượt thích</div>
              <div>{selectedPost.comments?.length || 0} bình luận</div>
            </div>
            <Divider />

            <List
              dataSource={[...(selectedPost.comments || [])].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )}
              renderItem={(item: any) => (
                <div style={{ display: "flex", marginBottom: 16 }}>
                  <Avatar src={item.userId?.avatar} />
                  <div style={{ marginLeft: 12, flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{item.userId?.name || 'Ẩn danh'}</div>
                    <div>{item.content}</div>
                    <div style={{ fontSize: 12, color: "#999" }}>{moment(item.createdAt).fromNow()}</div>
                  </div>
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu>
                        <Menu.Item icon={<DeleteOutlined />} onClick={() => showDeleteCommentConfirm(item._id)}>
                          Xoá bình luận
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <EllipsisOutlined style={{ fontSize: 20, cursor: "pointer", color: "#999" }} />
                  </Dropdown>
                </div>
              )}
            />
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default PostManagement;
