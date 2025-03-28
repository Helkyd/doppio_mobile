import React, { useEffect } from "react";
//import { SafeAreaView, StyleSheet } from "react-native";
//import { Button, Layout, Modal, Card, Text } from "@ui-kitten/components";

import { TouchableOpacity,SafeAreaView, View, FlatList, TextInput, StyleSheet } from 'react-native';
import { Input, Button, Layout, Modal, Card, Text, Spinner, Icon, IconElement } from "@ui-kitten/components";

import Form from "../components/form.component";
import { useFrappe } from "../provider/backend";
import styled from "styled-components/native";
import { FrappeApp } from "frappe-js-sdk";
import { FlashList } from "@shopify/flash-list";

import { format } from "date-fns";

import * as Linking from 'expo-linking';
import { BASE_URI } from "../data/constants";


const HomeScreenContainer = styled(Layout)`
 padding-top: 20px;
 padding-left:30px;
 padding-right: 30px;
`



const UnpaidFacturas = ({ item }) => {
  const formatarMoeda = new Intl.NumberFormat();
  console.log('Item data:', item);  // Add this to debug
  // Make sure item exists before trying to access its properties
  if (!item) return null;
/*
  return (
    <Card key={item.name} style={{ width: "100%", marginBottom: 20 }}>
      <Text style={{ fontSize: 10 }}>
        {item.posting_date ? format(item.posting_date, "dd-MM-yyyy") : ''} - 
        {item.doc_agt || ''} - 
        {item.customer || ''}
      </Text>
      <Text category="h6" style={{ fontSize: 12, color: 'red' }}>
        {item.outstanding_amount ? formatarMoeda.format(item.outstanding_amount) : ''}
      </Text>

      <Button 
        onPress={() => {
          console.log('pressed');
          if (item.name) {
            Linking.openURL(`${BASE_URI}/app/sales-invoice/${item.name}`)
          }
        }} 
        appearance="ghost"
      >
        Abrir
      </Button>
      <Layout style={{ marginVertical: 2 }}></Layout>      
    </Card>
  );
  */
};


const createInvoice = async () => {
  console.log('Create Invoice... ');
  console.log('customname ', customerName);
  console.log('tax id ', customerTaxID);
  console.log('Email ', email);
  if (email && validate(email)) {
    console.log('EMAIL VALIDO');
  } else if (email) {
    console.log("EMAIL INVALIDO")
    console.error("EMAIL INVALIDO");
    Toast.show({
      type: 'error',
      position: 'top',
      text1: 'EMAIL INVALIDO',
      text2: 'Volte a Digitar o Email'
    });

    return
  }

  if (phoneNumber && validate_phones(phoneNumber)) {
    console.log('Phone Number VALIDO');
  } else if (phoneNumber) {
    console.log("Phone Number INVALIDO")
    console.error("Phone Number INVALIDO");
    Toast.show({
      type: 'error',
      position: 'top',
      text1: 'Phone Number INVALIDO',
      text2: 'Volte a Digitar o Phone Number'
    });

    return

  }

  //Check if Exists first and after Save REcords
  db.getDocList('Customer', {
    /** Fields to be fetched */
    fields: ['name', 'customer_name','tax_id'],
    /** Filters to be applied - SQL AND operation */
    filters: [['tax_id', '=', customerTaxID]],
    /** Filters to be applied - SQL OR operation */
    asDict: false,
  })
    .then((docs) => {
      console.log(docs)
      console.log(docs == [])
      console.log(docs == null)
      console.log(docs.length)


      if (docs.length === 0) {
        console.log('CLIENTE NAO EXISTE PODE CRIAR...');
        //CREATE
        db.createDoc('Customer', {
          customer_name: customerName,
          tax_id: customerTaxID,
          email: email,
          phonenumber: phoneNumber,
        })
          .then((doc) => {
            console.log(doc)
            //TODO: ONCE Saved... Clear Fields and return to CUSTOMER LIST
            setCustomerName('');
            setCustomerTaxID('');
            setCustomerAddress('');
            setEmail('');
            setPhoneNumber('');
            setSearchNIF('');
            setCriarFactura(false)

          })
          .catch((error) => console.error(error));

        //TODO: API on aoerp_tools that will save the Customer with Company and Address

        

      } else {
        console.log('CUSTOMER ALREADY EXISTE.....')
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'O Cliente ja Existe.',
          text2: 'Este Cliente ja Existe no Sistema'
        });

      }


    })
    .catch((error) => {
      console.error(error)
      console.log('CREATE THE CUSTOMER...')
    });


  /*

  try {
    await axios.post(API_URL, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },        
      customer_name: customerName,
      email: email,
      phonenumber: phoneNumber,
      tax_id: customerTaxID,
    });
    fetchCustomers(); // Refresh the list
  } catch (error) {
    console.error(error);
  }
  */
};

export const HomeFacturas = () => {
  const navigateDetails = () => {
    setVisible(true);
    console.log('Criar FActrura TRUE');
    setCriarFactura(true);
  };

  const [visible, setVisible] = React.useState(false);
  const [criarFactura, setCriarFactura] = React.useState(false);
  
  const [customers, getCustomers] = React.useState([]);
  
  const [customerName, setCustomerName] = React.useState('');
  const [postingDate, setpostingDate] = React.useState('');

  <Layout
    style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
  >
    <Text category="h1"> FATURAS</Text>
  </Layout>

  const {db} = useFrappe();
  const [numerodeFacturas, setNumerodeFacturas] = React.useState(null);
  const [listaFacturas, setListaFacturas] = React.useState([]);
  const dateHoje = new Date();
  //const formatarMoeda = new Intl.NumberFormat();

  useEffect(() => {
    db.getCount('Sales Invoice').then((count) => {
      console.log('conta ', count)
      console.log('*****Data hoje ', `${dateHoje.getFullYear()}-${dateHoje.getMonth()+1}-${dateHoje.getDate()}`)
      setNumerodeFacturas(count)
    })

/*
    db.getDocList('Sales Invoice', {
      //fields: ["name","doc_agt","posting_date","customer","outstanding_amount","rounded_total","status"],
      filters: [['posting_date','<=', `${dateHoje.getFullYear()}-${dateHoje.getMonth()+1}-${dateHoje.getDate()}`],['status','!=','Paid'],['doc_agt','!=',""],['naming_series','like','FT%']],
      limit_start: 5,
      limit: 20,
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
*/
  }, [db])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeScreenContainer>
        {criarFactura == false && <Layout>
          <Text category="h5"> AngolaERP Demo15 Dashboard</Text>
          <Layout style={{ marginVertical: 10 }}></Layout>
          <Card status="success">
            <Text >Total de Facturas: {numerodeFacturas} </Text>
          </Card>

          <Layout style={{ marginVertical: 5 }}></Layout>
          <Card>
            <Text category="h6"> Facturas por Pagar</Text>
            <Button 
              style={styles.button} 
              size="tiny"  
              onPress={navigateDetails}
            >
              Create Invoice
            </Button>

            <Layout style={{ marginVertical: 5 }}></Layout>
            <Layout style={{ width: "100%", height: "100%" }}>
              <FlashList
                data={listaFacturas}
                renderItem={({ item }) => <UnpaidFacturas item={item} />}
                estimatedItemSize={100}
                keyExtractor={item => item.name}  // Add this line
              />

            </Layout>


          </Card>
        </Layout>}
        {criarFactura == true && 

        <Layout
            
          >
          <Text>FACTURASS..... </Text>
          <View style={styles.containerNewInvoice}>

                <TextInput

                  placeholder="Customer Name"
                  value={customerName}
                  onChangeText={setCustomerName}
                  style={styles.input}

                />
                <TextInput
                  placeholder="Posting Date"
                  value={postingDate}
                  onChangeText={setpostingDate}
                  style={styles.input}
                  
                />
                <TextInput
                  placeholder="Posting Time"
                  value={postingTime}
                  onChangeText={setpostingTime}
                  style={styles.input}
                  
                />
                <TextInput
                  placeholder="Due Date"
                  value={dueDate}
                  onChangeText={setdueDate}
                  style={styles.input}
                  
                />


              </View>
              

            <View style={styles.buttonContainer}>
                <Button 
                  style={styles.button} 
                  size="tiny"  
                  onPress={createInvoice}
                >
                  Add Customer
                </Button>
                <Button 
                  style={styles.button} 
                  size="tiny"  
                  onPress={() => {
                    setCustomerName('');
                    
                    setCriarFactura(false)
                  }}
                >
                  Dimiss
                </Button>
              </View>

          </Layout>
        }

      </HomeScreenContainer>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 100, marginTop: -100 , top: 100 },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  
  containerNewInvoice: {
    minHeight: 192,
    flexDirection: 'col',
    flexWrap: 'wrap',

  },
  
  container: {
    //flexDirection: 'col',
    //flexWrap: 'wrap',
    //minHeight: 192,
    flex: 1,
    flexDirection: 'row', // Align children from left to right
    flexWrap: 'wrap',
    alignItems: 'flex-start'    
  },  
  backdrop: {
    backgroundColor: "rgba(177, 78, 78, 0.5)",
  },
  button: {
    margin: 2,
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginVertical: 10,
  },


});
