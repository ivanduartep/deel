import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table } from "antd";
import { BaseLayout } from "../../components/BaseLayout";
import { getJobs } from "../../controllers/jobController";
import { dollarUS } from "../../utils/formatter";

const COLUMNS = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
  {
    title: "Contract",
    dataIndex: "ContractId",
    key: "ContractId",
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

export const JobsScreen = () => {
  const { user } = useSelector((state) => state.user);
  const { jobs } = useSelector((state) => state.job);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(getJobs(user.id));
    }
  }, [user]);
  return (
    <BaseLayout
      name={user ? `${user.firstName} ${user.lastName}` : null}
      balance={user ? user.balance : null}
      title={"Unpaid Jobs"}
    >
      <Table
        dataSource={jobs.map((item) => ({
          ...item,
          key: item.id,
          price: dollarUS.format(item.price),
        }))}
        columns={COLUMNS}
      />
    </BaseLayout>
  );
};
