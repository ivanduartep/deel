import React, { useEffect } from "react";
import { Form, Input, Button, Row, Layout, Typography, Col, Image } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../controllers/userController";
import "./styles.css";

const { Footer, Content } = Layout;
const { Title } = Typography;

export const LoginScreen = () => {
  const { loading, authenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      navigate("/jobs");
    }
  }, [authenticated]);

  const onFinish = (values) => {
    dispatch(login(values.userId));
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Layout>
        <Content style={{ padding: "50px 50px" }}>
          <div className="site-layout-content">
            <Row type="flex" align="middle">
              <Col
                xs={{ span: 20, offset: 2 }}
                sm={{ span: 16, offset: 3 }}
                md={{ span: 12, offset: 6 }}
                xl={{ span: 6, offset: 9 }}
              >
                <Image
                  preview={false}
                  width={150}
                  src="https://i.pinimg.com/originals/4e/71/e5/4e71e567648afaf7fd54f8fe5ebae40d.png"
                />
                <Title level={4}>Login with your User Id</Title>
                <br />
                <Form
                  name="loginForm"
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                  autoComplete="off"
                >
                  <Form.Item
                    label=""
                    name="userId"
                    rules={[
                      { required: true, message: "Please input your User Id!" },
                    ]}
                  >
                    <Input placeholder="User Id" />
                  </Form.Item>

                  <Form.Item>
                    <Button disabled={loading} type="primary" htmlType="submit">
                      Login
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ivan Duarte ©2021 Made with ❤️ in Baja
        </Footer>
      </Layout>
    </Layout>
  );
};
