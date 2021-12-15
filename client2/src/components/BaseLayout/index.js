import React from "react";
import { Layout, Menu, Typography } from "antd";
import { AppstoreOutlined, FormOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router";
import { dollarUS } from "../../utils/formatter";
import "./styles.css";

const { Footer, Content, Header } = Layout;
const { Title } = Typography;

export const BaseLayout = ({
  children,
  name,
  balance,
  withoutHeader = false,
  title,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Layout style={{ height: "100vh" }}>
      <Layout>
        {!withoutHeader && (
          <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
            <div className="logo" />
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={["/jobs"]}
              selectedKeys={[location.pathname]}
              onClick={({ key }) => {
                navigate(key);
              }}
            >
              <Menu.Item icon={<AppstoreOutlined />} key="/jobs">
                Jobs
              </Menu.Item>
              <Menu.Item icon={<FormOutlined />} key="/contracts">
                Contracts
              </Menu.Item>
            </Menu>
          </Header>
        )}
        <Content style={{ padding: "50px 50px" }}>
          <div className="site-layout-content">
            <div className="top-container">
              {name && <Title level={4}>{`Welcome ${name}`}</Title>}
              {name && balance && (
                <Title level={5}>{`Balance: ${dollarUS.format(
                  balance
                )}`}</Title>
              )}
            </div>

            <div className="content-container">
              <div className="sub-container">
                {title && (
                  <Title level={2} style={{ textAlign: "left" }}>
                    {`> ${title}`}
                  </Title>
                )}
                {children}
              </div>
            </div>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ivan Duarte ©2021 Made with ❤️ in Baja
        </Footer>
      </Layout>
    </Layout>
  );
};
