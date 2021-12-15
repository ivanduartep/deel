import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table } from "antd";
import { BaseLayout } from "../../components/BaseLayout";
import { getContracts } from "../../controllers/contractController";
import { dollarUS } from "../../utils/formatter";

const COLUMNS = (userType) => [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Terms",
    dataIndex: "terms",
    key: "terms",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: userType === "client" ? "Client" : "Contractor",
    dataIndex: userType === "client" ? "ClientId" : "ContractorId",
    key: userType === "client" ? "ClientId" : "ContractorId",
  },
  {
    title: "Created at",
    dataIndex: "createdAt",
    key: "createdAt",
  },
  {
    title: "Updated at",
    dataIndex: "updatedAt",
    key: "updatedAt",
  },
];

export const ContractsScreen = () => {
  const { user } = useSelector((state) => state.user);
  const { contracts } = useSelector((state) => state.contract);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(getContracts(user.id));
    }
  }, [user]);
  return (
    <BaseLayout
      name={user ? `${user.firstName} ${user.lastName}` : null}
      balance={user ? user.balance : null}
      title={"Contracts"}
    >
      <Table
        dataSource={contracts.map((item) => ({
          ...item,
          key: item.id,
          price: dollarUS.format(item.price),
        }))}
        columns={COLUMNS(user.type)}
      />
    </BaseLayout>
  );
};
