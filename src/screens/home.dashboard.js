import React, { useEffect } from "react";
import { SafeAreaView, View, Dimensions, StyleSheet } from "react-native";
import { Button, Layout, Modal, Card, Text } from "@ui-kitten/components";
import Form from "../components/form.component";
import { useFrappe } from "../provider/backend";
import styled from "styled-components/native";
import { FrappeApp } from "frappe-js-sdk";
import { FlashList } from "@shopify/flash-list";

import { format } from "date-fns";

import * as Linking from 'expo-linking';
import { BASE_URI } from "../data/constants";

import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";


const HomeScreenContainer = styled(Layout)`
 padding-top: 20px;
 padding-left:30px;
 padding-right: 30px;
`


const HomeDashboard_d = ({ item }) => {
  //This will be the main Screen
  const formatarMoeda = new Intl.NumberFormat();
  return (
    <Card key={item.name} style={{ width: "100%", marginBottom: 20 }}>
      <Text style={{ fontSize: 10 }}>{format(item.posting_date,"dd-MM-yyyy")} - {item.doc_agt} - {item.customer}</Text>
      <Text category="h6" style={{ fontSize: 12, color: 'red' }}>{formatarMoeda.format(item.outstanding_amount)}</Text>

      <Button onPress={() => {
        console.log('pressed');
        Linking.openURL(`${BASE_URI}/app/sales-invoice/${item.name}`)
      }} appearance="ghost"> Abrir</Button>
      <Layout style={{ marginVertical: 2 }}></Layout>      
    </Card>
  );
};


export const HomeDashboard = () => {
  <Layout
    style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
  >
    <Text category="h1"> FATURAS</Text>
  </Layout>

  const {db} = useFrappe();
  const [numerodeFacturas, setNumerodeFacturas] = React.useState(null);
  const [numerofacturasUnpaid, setNumeroFacturasUnpaid] = React.useState(null);
  const [numeroCustomers, setNumeroCustomers] = React.useState(null);

  const [listaFacturas, setListaFacturas] = React.useState([]);
  const dateHoje = new Date();
  //const formatarMoeda = new Intl.NumberFormat();

  useEffect(() => {
    db.getCount('Sales Invoice').then((count) => {
      console.log('conta ', count)
      console.log('Data hoje ', `${dateHoje.getFullYear()}-${dateHoje.getMonth()+1}-${dateHoje.getDate()}`)
      setNumerodeFacturas(count)
    })

    //Facturas nao Pagas
    const filters = [['status', '!=', 'Paid']];
    const useCache = true; /** Default is false - Optional **/
    const debug = false; /** Default is false - Optional **/
    
    db.getCount('Sales Invoice', filters, useCache, debug)
      .then((count) => {
        console.log(count)
        setNumeroFacturasUnpaid(count)
      })
      .catch((error) => console.error(error));

      //Numero de Clientes
      const custfilters = [['disabled', '!=', 1]];
      //const useCache = true; /** Default is false - Optional **/
      //const debug = false; /** Default is false - Optional **/
      
      db.getCount('Customer', custfilters, useCache, debug)
        .then((count) => {
          console.log(count)
          setNumeroCustomers(count)
        })
        .catch((error) => console.error(error));
    

      //Facturas Por Mes
      const factfilters = [['disabled', '!=', 1]];

        //TO ADD on aoerp_factura_facil as API
        /*
        SELECT 
        MONTH(posting_date) AS month_number,
        DATE_FORMAT(posting_date, '%M') AS month_name,
        COUNT(*) AS invoice_count,
        COALESCE(SUM(grand_total), 0) AS total_sales_amount
    FROM 
        `tabSales Invoice`
    WHERE 
        YEAR(posting_date) = YEAR(CURDATE())
    GROUP BY 
        month_number, month_name
    ORDER BY 
        month_number;            
        */

  }, [db])

  return (
    //TODO: Check Month to show 6 Months behinde
    <SafeAreaView style={{ flex: 1 }}>
        <Card>
          <Layout style={{ marginVertical: 10 }}></Layout>
          <Layout style={{ width: "100%", height: "50%" }}>
          <Card status="success">
          <View>
          <Text category="h6"> Grafico de FActuras</Text>
            <LineChart
              data={{
                labels: ["January", "February", "March", "April", "May", "June"],
                datasets: [
                  {
                    data: [
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100
                    ]
                  }
                ]
              }}
              width={Dimensions.get("window").width} // from react-native
              height={220}
              yAxisLabel="$"
              yAxisSuffix="k"
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: "#e26a00",
                backgroundGradientFrom: "#fb8c00",
                backgroundGradientTo: "#ffa726",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#ffa726"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </View>

          </Card>

          </Layout>

        </Card>      
      <HomeScreenContainer>

        <Card status="success">
          <Text category="h6">Total de Facturas: {numerodeFacturas} </Text>
        </Card>
        <Layout style={{ marginVertical: 10 }}></Layout>
        <Card status="danger">
          <Text category="h6">Facturas não Pagas: {numerofacturasUnpaid} </Text>
        </Card>
        <Layout style={{ marginVertical: 10 }}></Layout>
        <Card status="info">
          <Text category="h6">Numero de Clientes: {numeroCustomers} </Text>
        </Card>






      </HomeScreenContainer>
    </SafeAreaView>
  );
};

