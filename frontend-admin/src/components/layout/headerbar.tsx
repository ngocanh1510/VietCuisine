import { Button, Layout, Switch, message } from 'antd';
import useConfigStore from '../../store/config';
import { post } from '../../api/api';
import { useState, useEffect } from 'react';
const { Header } = Layout;

const Headerbar = (props: { colorBgContainer: string }) => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    console.log(storedName);
    if (storedName) {
      setUsername(storedName);
    }
  }, []);
  const setAlgorithm = useConfigStore(state => state.setAlgorithm)
  const handleLogout = async() => {
    // await post('/account/logout', {}); // Đường dẫn API logout
    message.success('Đăng xuất thành công!');

    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return (
    <Header title='VietCuisine Administrator' style={{ padding: 0, background: props.colorBgContainer }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: "0 20px", justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="https://scontent.fsgn2-10.fna.fbcdn.net/v/t1.15752-9/507015178_713140938078050_7242924077061164288_n.png?_nc_cat=109&ccb=1-7&_nc_sid=9f807c&_nc_ohc=B3_o5L7Q10UQ7kNvwH2HM0k&_nc_oc=Admm3xBj4L9VVNzr8HroHqoa8rk8pVLlzll1YthYM0pg5aWuUfklzJQYOKe1N2RVNYI&_nc_zt=23&_nc_ht=scontent.fsgn2-10.fna&oh=03_Q7cD2gFxiRv0jPx6arCxHO8Uxwa7ADuK42lb3-8JPQNrmEoWnA&oe=68806060" alt="VietCusine Logo" style={{ width: 60, height: 60 }} />
          <h2>VietCuiSine Administrator</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Switch checkedChildren="Light" unCheckedChildren="Dark" defaultChecked onChange={(checked) => setAlgorithm(checked ? 'default' : 'dark')} />
          <p style={{ marginRight: 10 }}>{username}</p>
          <img src="https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-1/470189796_1329970211331124_2139760179877886212_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=101&ccb=1-7&_nc_sid=0ecb9b&_nc_eui2=AeG6bziSE9h8wkIImTWjzzXYSTkGILzjc_xJOQYgvONz_HNmoalw00i_3oCJvht4ouvpc8F18e6b2t4eC1nzReZm&_nc_ohc=Ak5V8Ig4Pl4Q7kNvgGt-sF4&_nc_zt=24&_nc_ht=scontent.fsgn5-14.fna&_nc_gid=AI8b42z4TbL3H-FN431HbBS&oh=00_AYDFNsRREez4M65WqpLG5AAre1l9KI_xGbkdlomUuMcQAA&oe=67687461" alt="avatar" style={{ width: 40, height: 40 }} />
          <Button type="primary" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </Header>
  )
}

export default Headerbar
