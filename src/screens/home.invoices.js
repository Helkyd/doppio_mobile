import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { Button, Layout, Modal, Card, Text } from "@ui-kitten/components";
import Form from "../components/form.component";
import { useFrappe } from "../provider/backend";
import styled from "styled-components/native";
import { FrappeApp } from "frappe-js-sdk";

import { format } from "date-fns";


const HomeScreenContainer = styled(Layout)`
 padding-top: 20px;
 padding-left:30px;
 padding-right: 30px;
`

export const HomeFacturas = () => {
  <Layout
    style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
  >
    <Text category="h1"> FATURAS</Text>
  </Layout>

  const {db} = useFrappe();
  const [numerodeFacturas, setNumerodeFacturas] = React.useState(null);
  const [listaFacturas, setListaFacturas] = React.useState([]);
  const dateHoje = new Date();
  const formatarMoeda = new Intl.NumberFormat();

  useEffect(() => {
    db.getCount('Sales Invoice').then((count) => {
      console.log('conta ', count)
      console.log('Data hoje ', `${dateHoje.getFullYear()}-${dateHoje.getMonth()+1}-${dateHoje.getDate()}`)
      setNumerodeFacturas(count)
    })

    db.getDocList('Sales Invoice', {
      fields: ["name","doc_agt","posting_date","customer","outstanding_amount","rounded_total","status"],
      filters: [['posting_date','<=', `${dateHoje.getFullYear()}-${dateHoje.getMonth()+1}-${dateHoje.getDate()}`],['status','!=','Paid'],['doc_agt','!=',""],['naming_series','like','FT%']],
      limit_start: 5,
      limit: 10,
      orderBy: {
        field: "posting_date",
        order: 'desc',
      },
    }).then((data) => {
      console.log(data);
      const streams = data
      setListaFacturas(streams)
      console.log('factura1 ', streams[0])
      console.log('Data hoje ', dateHoje.getDate())
    })

  }, [db])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeScreenContainer>
        <Text category="h5"> AngolaERP Demo15 Dashboard</Text>
        <Layout style={{ marginVertical: 10 }}></Layout>
        <Card status="success">
          <Text >Total de Facturas: {numerodeFacturas} </Text>
        </Card>

        <Layout style={{ marginVertical: 10 }}></Layout>
        <Card>
          <Text category="h6"> Facturas por Pagar</Text>
          <Layout style={{ marginVertical: 10 }}></Layout>
          {listaFacturas.map((stream) => {
            return (
              <Layout key={stream.name} style={{ width: "100%", marginBottom: 10 }}>
                <Text style={{ fontSize: 10 }}>{format(stream.posting_date,"dd-MM-yyyy")} - {stream.doc_agt} - {stream.customer}</Text>
                <Text category="h6" style={{ fontSize: 12 }}>{formatarMoeda.format(stream.outstanding_amount)}</Text>
                <Layout style={{ marginVertical: 5 }}></Layout>
              </Layout>

            )
          })}
        </Card>



      </HomeScreenContainer>
    </SafeAreaView>
  );
};

