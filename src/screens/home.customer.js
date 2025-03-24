//import React from "react";
import React, { useEffect } from "react";
//import { SafeAreaView, StyleSheet } from "react-native";
import { SafeAreaView, View, FlatList, TextInput, StyleSheet } from 'react-native';
import { Input, Button, Layout, Modal, Card, Text, Spinner } from "@ui-kitten/components";

//import Form from "../components/form.component";
//import { Formik, Form, Field } from 'formik';


import { useFrappe } from "../provider/backend";

import { BASE_URI } from "../data/constants";

import Toast from 'react-native-toast-message';

import axios from 'axios';
//import { useContext, useEffect, useState } from "react";

const API_URL = "`${BASE_URI}`/api/resource/Customer"; 

export const HomeCustomer = () => {
  const navigateDetails = () => {
    setVisible(true);
    setCriarCliente(true);
  };

  const [visible, setVisible] = React.useState(false);
  const [criarCliente, setCriarCliente] = React.useState(false);

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

  const [searchNIF, setSearchNIF] = React.useState('');

  
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
    console.log('Create Customer... ');
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
            .then((doc) => console.log(doc))
            .catch((error) => console.error(error));

          //TODO: API on aoerp_tools that will save the Customer with Company and Address

          //TODO: ONCE Saved... Clear Fields and return to CUSTOMER LIST

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
  
  async function validarNIF(nifempresa) {
    console.log('nif a valida ', nifempresa);

    call
      .get("aoerp_tools.util.angola.validar_nif", {'nif':searchNIF})
      .then((result) => {
        console.log('NIF RESULT ',result)
        console.log("NIF INVALIDO ",result.message);
        console.log('NIF EMP ',result.message[2]);        
        if (result.message == "NIF INVALIDO") {
          setCustomerName("");
          setCustomerTaxID("");

          Toast.show({
            type: 'error',
            position: 'top',
            text1: 'NIF INVALIDO',
            text2: 'Volte da Digitar'
          });

        } else {
          setCustomerName(result.message[2]);
          setCustomerTaxID(searchNIF);
  
        }

        
        
      })
      .catch((error) => console.error(error));    
    
  }
  const OLDvalidarNif = (nifempresa) => {
    console.log('nif a valida ', nifempresa);

    call
      .get("aoerp_tools.util.angola.validar_nif", {'nif':searchNIF})
      .then((result) => {
        console.log('NIF RESULT ',result)
        return result.message;
        
      })
      .catch((error) => console.error(error));    

  }

  const handleChange = (event) => {
    const value = event.target.value;
    console.log('HANDLE CHANGE Customer Name')
    setCustomerName(value);
  };

  // Log changes to customerName (optional)
  useEffect(() => {
    console.log('customerName updated:', customerName);
  }, [customerName]);

  //NEW FORM
  function handleSubmit(e) {
    console.log('NOVA FORMA HANDLE SUBMIT....');
    // Prevent the browser from reloading the page
    e.preventDefault();

    // Read the form data
    const form = e.target;
    const formData = new FormData(form);

    // You can pass formData as a fetch body directly:
    fetch('/some-api', { method: form.method, body: formData });

    // Or you can work with it as a plain object:
    const formJson = Object.fromEntries(formData.entries());
    console.log(formJson);
  }  

  //VALIDATE EMAILS
  const validate = (values) => {
    const errors = {}
    
    console.log('VALUE Email ', values);
    console.log('TESTAR EMAIL ', (/\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/i.test(values)));

    if (!values) {
      errors.email = 'Required'
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Email Necessario',
        text2: 'Digite o Email'
      });

    } else if (!(/\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/i.test(values))) {
      errors.email = 'Invalid email address'
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Email INVALIDO',
        text2: 'Volte a Digitar'
      });

    }
    return errors    
  }
  
    //VAlidate Phone /^(\+\d{1,3}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{3}$|^(\+\d{1,3}\d{9})|^(\d{12})|^(\d{9})/
  //VALIDATE Phones
  const validate_phones = (values) => {
    const errors = {}
    
    console.log('VALUE PhoneEmail ', values);
    console.log('TESTAR Phone ', (/^(\+\d{1,3}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{3}$|^(\+\d{1,3}\d{9})|^(\d{12})|^(\d{9})/i.test(values)));

    if (!values) {
      errors.phone = 'Required'
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Phone Necessario',
        text2: 'Digite o Phone'
      });

    } else if (!(/^(\+\d{1,3}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{3}$|^(\+\d{1,3}\d{9})|^(\d{12})|^(\d{9})/i.test(values))) {
      errors.phone = 'Invalid Phone Number'
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Phone INVALIDO',
        text2: 'Volte a Digitar'
      });

    }
    return errors
  }
  

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {criarCliente == false && 
      <Layout
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Button onPress={navigateDetails}>Create Customer</Button>

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

      }
      {criarCliente == true && 
      <Layout
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >

        <View style={styles.container}>

          <Input
            label='NIF Empresa/Indivual'
            value={searchNIF}
            onSubmitEditing={() => {
              console.log('NIF VALIDATE.... ',searchNIF);
              if (searchNIF.length >= 10){
                validarNIF(searchNIF);  
              } else {
                Toast.show({
                  type: 'error',
                  position: 'top',
                  text1: 'NIF INVALIDO',
                  text2: 'Volte da Digitar'
                });
    
              }
            }}
            onChangeText={(nextValue) => setSearchNIF(nextValue)}
            placeholder="Procurar NIF ?"
            style={{ marginBottom: 50, width:200 }}
          />

              <TextInput

                placeholder="Customer Name"
                value={customerName}
                onChangeText={setCustomerName}
                style={styles.input}
                readOnly
              />
              <TextInput
                placeholder="Nif"
                value={customerTaxID}
                onChangeText={setCustomerTaxID}
                style={styles.input}
                readOnly
              />

              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                //onChangeText={(setEmail) => validate(setEmail)}
                style={styles.input}

              />
              <TextInput
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={styles.input}
              />
              <TextInput
                placeholder="Type Address"
                value={customerAddress}
                onChange={setCustomerAddress}
                style={styles.input}
              />

              <Button title="Add Customer" onPress={createCustomer} />

              <FlatList
                data={customers}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <View style={styles.item}>
                    <Text>{item.customer_name}</Text>
                    <Text>{item.email}</Text>
                    <Text>{item.phoneNumber}</Text>
                  </View>
                )}
              />
            </View>
   


          <Button onPress={() => {
            setCustomerName('');
            setCustomerTaxID('');
            setCustomerAddress('');
            setEmail('');
            setPhoneNumber('');
            setSearchNIF('');
            setCriarCliente(false)
          }}
            >DISMISS</Button>
        </Layout>
      }
    </SafeAreaView>
  );
};

/*
const styles = StyleSheet.create({
  container: {
    minHeight: 192,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

});
*/

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 100, marginTop: -100 , top: 100 },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  container: {
    minHeight: 192,
  },
  backdrop: {
    backgroundColor: "rgba(177, 78, 78, 0.5)",
  },

});
