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

  const fetchCustomers = async () => {
    console.log('FETCH CUSTOMERS....');
    try {
      const response = await axios.get(API_URL,{
        headers: {
          'Content-Type': 'multipart/form-data',
        },        
      });
      setCustomers(response.data.data);
    } catch (error) {
      console.error(error);
    }
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
      });
      fetchCustomers(); // Refresh the list
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    fetchCustomers();
  }, []);
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Button onPress={navigateDetails}>OPEN MODAL</Button>

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

        <Modal
          visible={visible}
          backdropStyle={styles.backdrop}
          onBackdropPress={() => setVisible(false)}
        >
          <Card disabled={true}>
            <Text>Welcome to DoppioMobile</Text>
            <Button onPress={() => setVisible(false)}>DISMISS</Button>
          </Card>
        </Modal>

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

