import React, { useState, useEffect } from 'react';
import { SafeAreaView, View,  TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

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

export const HomeFacturas = () => {
  //const HomeFacturas = ({ visible, onClose, onSubmit }) => {
    const navigateDetails = () => {
      setVisible(true);
      console.log('Criar FActrura TRUE');
      setCriarFactura(true);
    };
  
  const [visible, setVisible] = React.useState(false);
  const [onClose, setonClose] = React.useState(false);
  const [onSubmit, setonSubmit] = React.useState(false);

  const [criarFactura, setCriarFactura] = React.useState(false);    
  const {db} = useFrappe();
  const [numerodeFacturas, setNumerodeFacturas] = React.useState(null);
  const [listaFacturas, setListaFacturas] = React.useState([]);
  const dateHoje = new Date();
  
  // Customer options
  const customerOptions = [
    'John Doe',
    'Jane Smith',
    'Robert Johnson',
    'Emily Davis',
    'Michael Wilson'
  ];

  // Item options
  const itemOptions = [
    { code: 'ITM001', name: 'Laptop', description: '15" Business Laptop', price: 899.99, uom: 'EA' },
    { code: 'ITM002', name: 'Mouse', description: 'Wireless Mouse', price: 24.99, uom: 'EA' },
    { code: 'ITM003', name: 'Keyboard', description: 'Mechanical Keyboard', price: 59.99, uom: 'EA' },
    { code: 'ITM004', name: 'Monitor', description: '27" 4K Monitor', price: 299.99, uom: 'EA' },
    { code: 'ITM005', name: 'Headphones', description: 'Noise Cancelling', price: 199.99, uom: 'EA' }
  ];

  // State for form fields
  const [formData, setFormData] = useState({
    customer_name: customerOptions[0],
    posting_date: new Date().toISOString().split('T')[0],
    posting_time: new Date().toTimeString().substring(0, 5),
    company: '',
    items: [{
      item_code: itemOptions[0].code,
      item_name: itemOptions[0].name,
      description: itemOptions[0].description,
      price: itemOptions[0].price,
      qtd: '1',
      uom: itemOptions[0].uom,
      total: itemOptions[0].price * 1
    }]
  });

  // Handle input changes
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'qtd' ? value : value,
    };

    // Recalculate total if qtd or price changes
    if (field === 'qtd' || field === 'price') {
      const qtd = parseFloat(field === 'qtd' ? value : updatedItems[index].qtd) || 0;
      const price = parseFloat(field === 'price' ? value : updatedItems[index].price) || 0;
      updatedItems[index].total = (qtd * price).toFixed(2);
    }

    // Update item name, description, etc. when item code changes
    if (field === 'item_code') {
      const selectedItem = itemOptions.find(item => item.code === value);
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          item_name: selectedItem.name,
          description: selectedItem.description,
          price: selectedItem.price,
          uom: selectedItem.uom,
          total: (parseFloat(updatedItems[index].qtd || 0) * selectedItem.price).toFixed(2)
        };
      }
    }

    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  // Add new item row
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          item_code: itemOptions[0].code,
          item_name: itemOptions[0].name,
          description: itemOptions[0].description,
          price: itemOptions[0].price,
          qtd: '1',
          uom: itemOptions[0].uom,
          total: itemOptions[0].price * 1
        }
      ]
    });
  };

  // Remove item row
  const removeItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

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

  }, [db])


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout style={{ flex: 1, padding: 16 }}>
        {!criarFactura && (
          <View style={{ flex: 1 }}>
            <Text category="h5">AngolaERP Demo15 Dashboard</Text>
            <Layout style={{ marginVertical: 10 }} />
            <Card status="success">
              <Text>Total de Facturas: {numerodeFacturas}</Text>
            </Card>

            <Layout style={{ marginVertical: 5 }} />
            <Card>
              <Text category="h6">Facturas por Pagar</Text>
              <Button 
                style={styles.button} 
                size="tiny"  
                onPress={navigateDetails}
              >
                Create Invoice
              </Button>

              <Layout style={{ marginVertical: 5 }} />
              <View style={{ width: "100%", height: "100%" }}>
                <FlashList
                  data={listaFacturas}
                  renderItem={UnpaidFacturas}
                  estimatedItemSize={100}
                />
              </View>
            </Card>
          </View>
        )}
        
        <Modal visible={visible} animationType="slide" transparent={false}>
          <ScrollView style={styles.container}>
            <Text style={styles.header}>Customer Information</Text>
            
            {/* Customer Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer Name</Text>
              <Picker
                selectedValue={formData.customer_name}
                onValueChange={(value) => handleInputChange('customer_name', value)}
                style={styles.picker}
              >
                {customerOptions.map((customer, index) => (
                  <Picker.Item key={index} label={customer} value={customer} />
                ))}
              </Picker>
            </View>

            {/* Posting Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Posting Date</Text>
              <TextInput
                style={styles.input}
                value={formData.posting_date}
                onChangeText={(text) => handleInputChange('posting_date', text)}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* Posting Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Posting Time</Text>
              <TextInput
                style={styles.input}
                value={formData.posting_time}
                onChangeText={(text) => handleInputChange('posting_time', text)}
                placeholder="HH:MM"
              />
            </View>

            {/* Company */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company</Text>
              <TextInput
                style={styles.input}
                value={formData.company}
                onChangeText={(text) => handleInputChange('company', text)}
                placeholder="Company Name"
              />
            </View>

            <Text style={[styles.header, { marginTop: 20 }]}>Items</Text>
            
            {/* Items Table */}
            {formData.items.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemHeader}>Item #{index + 1}</Text>
                
                {/* Item Code */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Item Code</Text>
                  <Picker
                    selectedValue={item.item_code}
                    onValueChange={(value) => handleItemChange(index, 'item_code', value)}
                    style={styles.picker}
                  >
                    {itemOptions.map((option, idx) => (
                      <Picker.Item key={idx} label={option.code} value={option.code} />
                    ))}
                  </Picker>
                </View>

                {/* Item Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Item Name</Text>
                  <TextInput
                    style={styles.input}
                    value={item.item_name}
                    editable={false}
                  />
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={styles.input}
                    value={item.description}
                    editable={false}
                  />
                </View>

                {/* Price */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Price</Text>
                  <TextInput
                    style={styles.input}
                    value={item.price.toString()}
                    editable={false}
                  />
                </View>

                {/* Quantity */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={item.qtd}
                    onChangeText={(text) => handleItemChange(index, 'qtd', text)}
                    keyboardType="numeric"
                  />
                </View>

                {/* UOM */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Unit of Measure</Text>
                  <TextInput
                    style={styles.input}
                    value={item.uom}
                    editable={false}
                  />
                </View>

                {/* Total */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Total</Text>
                  <TextInput
                    style={styles.input}
                    value={item.total.toString()}
                    editable={false}
                  />
                </View>

                {/* Remove button for items beyond the first one */}
                {index > 0 && (
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => removeItem(index)}
                  >
                    <Text style={styles.removeButtonText}>Remove Item</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Add Item Button */}
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Text style={styles.addButtonText}>+ Add Item</Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    marginVertical: 10,
  },
});

//export default HomeFacturas;