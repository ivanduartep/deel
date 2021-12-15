import React from "react";
import { Typography } from "antd";
import { BaseLayout } from "../../components/BaseLayout";

const { Title } = Typography;

export const ErrorScreen = ({ message }) => {
  return (
    <BaseLayout withoutHeader>
      <div style={{ alignSelf: "center", width: "100%", textAlign: "center" }}>
        <Title level={2}>
          {message ? message : "404 - We cannot found the page requested"}
        </Title>
      </div>
    </BaseLayout>
  );
};
