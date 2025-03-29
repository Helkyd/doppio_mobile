import React, { useContext, useEffect } from "react";
import { AuthContext } from "../provider/auth";

import { SafeAreaView, View, Dimensions, StyleSheet } from "react-native";
import { Spinner, Button, Layout, Modal, Card, Text } from "@ui-kitten/components";
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

export const HomeDashboard = () => {
  // 1. First: Always call hooks at the top level
  //const { accessToken, refreshAccessTokenAsync, isAuthenticated } = useContext(AuthContext);
  const { refreshAccessTokenAsync, isAuthenticated, logout, userInfo, accessToken, fetchUserInfo } = useContext(AuthContext);    
  const { db } = useFrappe();
  
  // 2. State hooks next
  const [isLoading, setIsLoading] = React.useState(true);
  const [numerodeFacturas, setNumerodeFacturas] = React.useState(null);
  const [numerofacturasUnpaid, setNumeroFacturasUnpaid] = React.useState(null);
  const [numeroCustomers, setNumeroCustomers] = React.useState(null);
  const [listaFacturas, setListaFacturas] = React.useState([]);
  
  // 3. Derived values
  const dateHoje = new Date();

  // 4. Effects
  useEffect(() => {
    if (!isAuthenticated || !db) {
      setIsLoading(false);
      return;
    }

    let isMounted = true; // Add cleanup flag

    const fetchData = async () => {
      try {
        setIsLoading(true);

/*
        //Get from contarfacturas
        const searchParams0 = {
          usename: userInfo.email,
        };

        call
        .get('angola_erp.api.invoices.contarFacturas', searchParams0)
        .then((result) => {
          console.log('**** CONTAGEM FACTURAs..... ')
          //console.log(result.message)
          console.log('USER ',userInfo.email)
          console.log(result.message[0])
          const streams = result.message
          count =streams;
        })
        .catch((error) => {
          console.error(error)
        });

        //Get from all_invoices
        const searchParams = {
          usename: userInfo.email,
          statusfactura: ['Unpaid','Overdue']
        };            

        console.log('Search PARAM')
        console.log(searchParams)

        call
        .get('angola_erp.api.invoices.all_invoices', searchParams)
        .then((result) => {
          console.log('**** LISTA DE FACTURAs..... ')
          //console.log(result.message)
          console.log('USER ',userInfo.email)
          console.log(result.message[0])
          const streams = result.message
          unpaidCount = streams;

        })
        .catch((error) => {
          console.error(error)
        });

*/
        
        const [count,unpaidCount,customerCount] = await Promise.all([
          db.getCount('Sales Invoice'),
          db.getCount('Sales Invoice', [['status', '!=', 'Paid']]),
          db.getCount('Customer', [['disabled', '!=', 1]])
        ]);
        
        if (isMounted) {
          setNumerodeFacturas(count);
          setNumeroFacturasUnpaid(unpaidCount);
          setNumeroCustomers(customerCount);
        }
      } catch (e) {
        if (isMounted) {
          if (e.httpStatus === 403 || e.httpStatus === 401) {
            await refreshAccessTokenAsync();
          } else {
            Toast.show({
              type: "error",
              position: 'top',
              text1: 'Error',
              text2: e.message
            });
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [accessToken, db, isAuthenticated, refreshAccessTokenAsync]);

  // 5. Early returns after all hooks
  if (!isAuthenticated) {
    return (
      <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text category="h6">Please log in to view the dashboard</Text>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size='giant' />
        <Text style={{ marginTop: 10 }}>Loading dashboard data...</Text>
      </Layout>
    );
  }

  // 6. Main component render
  return (
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
                  datasets: [{
                    data: [
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100
                    ]
                  }]
                }}
                width={Dimensions.get("window").width}
                height={220}
                yAxisLabel="$"
                yAxisSuffix="k"
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: "#e26a00",
                  backgroundGradientFrom: "#fb8c00",
                  backgroundGradientTo: "#ffa726",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
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