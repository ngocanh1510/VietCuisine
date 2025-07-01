// components/PostDetailModal.tsx
import React from 'react';
import { Avatar, Card, Divider, List, Modal, Typography, Dropdown, Menu } from 'antd';
import { DeleteOutlined, EllipsisOutlined, LikeOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Paragraph } = Typography;

const PostDetailModal = ({ visible, onClose, post, onDeleteComment }: any) => {
  if (!post) return null;

  return (
    <Modal
      open={visible}
      title="Chi tiết bài viết"
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Card bordered={false}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <Avatar src={post.userId?.avatar} size={48} />
          <div style={{ marginLeft: 12 }}>
            <strong>{post.userId?.name || "Ẩn danh"}</strong>
            <div style={{ fontSize: 12, color: "#888" }}>
              {moment(post.createdAt).fromNow()}
            </div>
          </div>
        </div>

        <Title level={4}>{post.caption}</Title>

        {post.image && (
          <img
            src={post.image}
            alt="post"
            style={{ width: "90%", maxHeight: 500, objectFit: "cover", borderRadius: 8 }}
          />
        )}

        {post.recipeId && (
          <Paragraph><strong>Công thức:</strong> {post.recipeId.title}</Paragraph>
        )}

        <Divider />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div><LikeOutlined style={{ color: "#1890ff", marginRight: 6 }} /> {post.likes?.length || 0} lượt thích</div>
          <div>{post.comments?.length || 0} bình luận</div>
        </div>
        <Divider />

        <List
          dataSource={[...(post.comments || [])].sort(
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
                    <Menu.Item icon={<DeleteOutlined />} onClick={() => onDeleteComment(item._id)}>
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
    </Modal>
  );
};

export default PostDetailModal;
