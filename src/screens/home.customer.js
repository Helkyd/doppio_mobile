//import React from "react";
import React, { useEffect } from "react";
//import { SafeAreaView, StyleSheet } from "react-native";
import { SafeAreaView, View, FlatList, TextInput, StyleSheet } from 'react-native';
import { Button, Layout, Modal, Card, Text } from "@ui-kitten/components";
import Form from "../components/form.component";

import { useFrappe } from "../provider/backend";

import { BASE_URI } from "../data/constants";

import axios from 'axios';
//import { useContext, useEffect, useState } from "react";

const API_URL = "`${BASE_URI}`/api/resource/Customer"; 

export const HomeCustomer = () => {
  const navigateDetails = () => {
    setVisible(true);
  };

  const [visible, setVisible] = React.useState(false);

  const [customers, setCustomers] = React.useState([]);
  const [customerName, setCustomerName] = React.useState('');
  const [customerType, setCustomerType] = React.useState('');
  const [customerGroup, setCustomerGroup] = React.useState('');
  const [customerTaxID, setCustomerTaxID] = React.useState('');
  const [customerAddress, setCustomerAddress] = React.useState('');


  const [email, setEmail] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');

  const {db, call} = useFrappe();
  const [numerodeFacturas, setNumerodeFacturas] = React.useState(null);
  const [listaFacturas, setListaFacturas] = React.useState([]);

  const [customerCount, setCustomerCount] = React.useState(null);
  const [listaCustomers, setListaCustomers] = React.useState([]);

  const dateHoje = new Date();

  
  const fetchCustomers = () => {
    console.log('FETCH CUSTOMERS....pppp');
/*
    const searchParams = {
      doctype: 'Customer',
      status: 'Active',
    };
    call
      .get("frappe.client.get('Customer',None,filters={'status':'Active'})")
      .then((result) => console.log('listaCustomers',result))
      .catch((error) => console.error(error));
*/
/*
    db.getCount('Customer').then((count) => {
      console.log('conta ', count)
      console.log('Data hoje ', `${dateHoje.getFullYear()}-${dateHoje.getMonth()+1}-${dateHoje.getDate()}`)
      setCustomerCount(count)
    })
*/
  db.getDocList('Customer',{
    fields: ['name','customer_name','tax_id','email','phonenumber'],
    filters: [['docstatus','!=',1]],
    limit_start: 5,
    limit: 20,
    orderBy: {
      field: "customer_name",
      order: 'desc',
    },

  })
    .then((docs) => {
      console.log('Ficha de Clientes')
      console.log(docs)
      const streams = docs
      setListaCustomers(streams)

    })
    .catch((error) => console.error(error));


    console.log('FACTURAS aaaa ')
    /*
    db.getDocList('Sales Invoice', {
      fields: ["name","doc_agt","posting_date","customer","outstanding_amount","rounded_total","status"],
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
      //setListaFacturas(streams)
      console.log('factura1 ', streams[0])
      console.log('Data hoje ', dateHoje.getDate())
    })
    
*/
    //TO Test "https://jsonplaceholder.typicode.com/posts/1"
    /*
    try {
      const response = await axios.get(API_URL,{
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': 'https://demo15.angolaerp.co.ao',
          'Referer': 'https://demo15.angolaerp.co.ao',
        },        
      });
      console.log('Data received:', response.data);      
      setCustomers(response.data.data);
    } catch (error) {
      console.error(error);
    }
    */
    /*
    //Trying Fetch
    fetch(API_URL, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },        

    }
    )
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Data received:', data);
        setCustomers(data);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });    
      */
  };

  const createCustomer = async () => {
    try {
      await axios.post(API_URL, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },        
        customer_name: customerName,
        email: email,
        phone: phone,
        tax_id: tax_id,
      });
      fetchCustomers(); // Refresh the list
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    fetchCustomers();
    /*
    db.getDocList('Supplier', {
      fields: ["name","status"],
      filters: [['docstatus','>=', 0]],
      limit_start: 5,
      limit: 20,
      orderBy: {
        field: "name",
        order: 'desc',
      },
    }).then((data) => {
      console.log('Ficha de Clientes')
      console.log(data);
      //const streams = data
      //setListaCustomers(streams)
     // console.log('Cliente ', streams[0])

    })
     */
        
  }, [db]);
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Button onPress={navigateDetails}>Create Customer</Button>


        <Modal centered style={{ justifyContent: "left", alignItems: "left" }}
          visible={visible}
          backdropStyle={styles.backdrop}
          onBackdropPress={() => setVisible(false)}
        >

          <Form props={{
            fields: [
              {
                name: "firstName",
                label: "First Name",
                rules: {
                  required: true,
                },
                type: "text"
              },
              {
                name: "lastName",
                label: "Last Name",
                rules: {
                  required: false,
                },
                type: "text"
              },

              {
                name: "will_send_updates",
                label: "Send Updates",
                rules: {
                  required: false,
                },
                type: "checkbox"
              }]
          }} />
          <Button onPress={() => setVisible(false)}>DISMISS</Button>

        </Modal>

        <FlatList
        data={listaCustomers}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text >Customer {item.customer_name}</Text>
            {item.tax_id != null && <Text>NIF: {item.tax_id}</Text>}
            {item.email != null && <Text>@: {item.email}</Text>}
            {item.phonenumber != null && <Text>Telef. {item.phonenumber}</Text>}
            <Layout style={{ marginVertical: 5 }}></Layout>
          </View>
        )}
      />        
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

});

