import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, TextInput, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Card, Button, Layout } from '@ui-kitten/components';
import { FlashList } from '@shopify/flash-list';

//import DatePicker from 'react-native-date-picker';
import DateTimePicker from '@react-native-community/datetimepicker';


import { useFrappe } from "../provider/backend";
import styled from "styled-components/native";
import { FrappeApp } from "frappe-js-sdk";


import { format } from "date-fns";

import * as Linking from 'expo-linking';
import { BASE_URI } from "../data/constants";


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


export const HomeFacturas = ()  => {
  const [criarFactura, setCriarFactura] = useState(false);
  const [numerodeFacturas, setNumerodeFacturas] = useState(0);
  const [listaFacturas, setListaFacturas] = useState([]);
  const [visible, setVisible] = useState(false);
  const [onSubmit, setonSubmit] = React.useState(false);

  const [customerOptions, setcustomerOptions] = React.useState([]);
  const [itemOptions, setitemOptions] = React.useState([]);
  
  const {db} = useFrappe();
  const dateHoje = new Date();

  //const [datePickerOpen, setDatePickerOpen] = useState(false);  
  //const [date, setDate] = useState(new Date());
  //const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);  

  // Helper function to parse date strings in dd-MM-yyyy format
  const parseCustomDate = (dateString) => {
    if (!dateString) return new Date();
    
    // If already in ISO format (from initial state), parse directly
    if (dateString.includes('T')) {
      return new Date(dateString);
    }
    
    // Parse dd-MM-yyyy format
    const [day, month, year] = dateString.split('-');
    return new Date(`${year}-${month}-${day}`);
  };

  // Format date to dd-MM-yyyy
  const formatDate = (date) => {
    return format(date, 'dd-MM-yyyy');
  };

  const ol_handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      //handleInputChange('posting_date', format(selectedDate, 'dd-MM-yyyy'));
      //handleInputChange('due_date', formatDate(calculateDueDate(selectedDate)));
      //handleInputChange('posting_date', formatDate(selectedDate));
      //handlePostingDateChange('posting_date',selectedDate)
      handleInputChange('posting_date', formatDate(selectedDate));
      handleInputChange('due_date', formatDate(posting_date));

    }
  };
  
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      const dueDate = formatDate(new Date(selectedDate.setDate(selectedDate.getDate() + 30)));
      
      // Update both fields in one state update
      setFormData(prev => ({
        ...prev,
        posting_date: formattedDate,
        due_date: dueDate
      }));
    }
  };

  const handlePostingDateChange = (selectedDate) => {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    console.log(selectedDate.value)
    console.log(formatDate(selectedDate))
    console.log(calculateDueDate(selectedDate))

    const formattedDate = format(selectedDate, 'dd-MM-yyyy');
    setFormData({
      ...formData,
      //posting_date: formattedDate,
      due_date: calculateDueDate(formattedDate)
    });
  };

  // Form data state
  const [formData, setFormData] = useState({
    customer_name: '',
    posting_date: formatDate(new Date()), //new Date().toISOString().split('T')[0],
    posting_time: new Date().toTimeString().substring(0, 5),
    due_date: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Initialize with +30 days
    company: '',
    items: [{
      item_code: '',
      item_name: '',
      description: '',
      price: 0,
      qtd: '1',
      uom: '',
      total: 0
    }]
  });

  // Customer options
  /*
  const customerOptions = [
    'John Doe',
    'Jane Smith',
    'Robert Johnson',
    'Emily Davis',
    'Michael Wilson'
  ];
  */

  // Item options
  /*
  const itemOptions = [
    { code: 'ITM001', name: 'Laptop', description: '15" Business Laptop', price: 899.99, uom: 'EA' },
    { code: 'ITM002', name: 'Mouse', description: 'Wireless Mouse', price: 24.99, uom: 'EA' },
    { code: 'ITM003', name: 'Keyboard', description: 'Mechanical Keyboard', price: 59.99, uom: 'EA' },
    { code: 'ITM004', name: 'Monitor', description: '27" 4K Monitor', price: 299.99, uom: 'EA' },
    { code: 'ITM005', name: 'Headphones', description: 'Noise Cancelling', price: 199.99, uom: 'EA' }
  ];
  */

  // Initialize form data when modal opens
  const openModal = () => {
    const today = new Date();
    setFormData({
      customer_name: '',
      //posting_date: new Date().toISOString().split('T')[0],
      //posting_date: formatDate(new Date()), // Use formatted date
      //posting_time: new Date().toTimeString().substring(0, 5),
      posting_date: formatDate(today),
      posting_time: today.toTimeString().substring(0, 5),      
      due_date: formatDate(new Date(today.setDate(today.getDate() + 30))),
      company: '',
      items: [{
        item_code: '', //itemOptions[0].code,
        item_name: '', //itemOptions[0].name,
        description: '', //itemOptions[0].description,
        price: '', //itemOptions[0].price,
        qtd: '1',
        uom: '', //itemOptions[0].uom,
        total: '', //itemOptions[0].price * 1
      }]
    });
    setVisible(true);
  };


  const navigateDetails = () => {
    setCriarFactura(true);
    openModal();
  };

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    const formatarMoeda = new Intl.NumberFormat();

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    if (field === 'qtd' || field === 'price') {
      const qtd = parseFloat(field === 'qtd' ? value : updatedItems[index].qtd) || 0;
      const price = parseFloat(field === 'price' ? value : updatedItems[index].price) || 0;
      updatedItems[index].total = (qtd * price).toFixed(2);
    }

    if (field === 'item_code') {
      const selectedItem = itemOptions.find(item => item.code === value);
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          item_name: selectedItem.name,
          description: selectedItem.description,
          price: formatarMoeda.format(selectedItem.price),
          uom: selectedItem.uom,
          total: formatarMoeda.format((parseFloat(updatedItems[index].qtd || 0) * selectedItem.price).toFixed(2))
        };
      }
    }

    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const addItem = () => {
    if (itemOptions.length === 0) return;
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

  const removeItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const old_handleSubmit = () => {
    console.log('Form submitted:', formData);
    setVisible(false);
    setCriarFactura(false);
  };
  const handleSubmit = () => {
    // Validate that all items have item_code selected
    const hasEmptyItemCode = formData.items.some(item => !item.item_code);
    
    if (hasEmptyItemCode) {
      alert('Please select an item code for all items');
      return;
    }
  
    // Validate customer is selected
    if (!formData.customer_name) {
      alert('Please select a customer');
      return;
    }
  
    console.log('Form submitted:', formData);

    // Format dates to YYYY-MM-DD
    const formatToBackendDate = (dateString) => {
      if (!dateString) return '';
      // If already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // Parse from dd-MM-yyyy to YYYY-MM-DD
      const [day, month, year] = dateString.split('-');
      return `${year}-${month}-${day}`;
    };
    const postingDate = formatToBackendDate(formData.posting_date);
    const dueDate = formatToBackendDate(formData.due_date);

    console.log('Formatted posting date:', postingDate);
    console.log('Formatted due date:', dueDate);

    //CREATE
    //TODO: Company should be based on CUSTOMER SETUP
    //Bcs is FACTURA FACIL has no need to set IVA... but might have to create
    const tabelaItens = formData.items.map(item => ({
      item_code: item.item_code || item.name,
      item_name: item.item_name,
      description: item.description,
      rate: item.price,
      uom: item.stock_uom,
      qty: item.qtd
    }));


    db.createDoc('Sales Invoice', {
      customer: formData.customer_name,
      company: 'Para Testes',
      posting_date: postingDate,
      posting_time: formData.posting_time,
      due_date: dueDate,
      update_stock: 0,  //Default for FACTURA FACIL; No STOCK
      items: tabelaItens,
      status: 'Draft' //TESTING BEFORE SUMITTING...

    })
      .then((doc) => {
        console.log('FACTURA CRIADA......')
        console.log(doc)
        //TODO: ONCE Saved... Clear Fields and return to CUSTOMER LIST
        setVisible(false);
        setCriarFactura(false);
    
      })
      .catch((error) => console.error(error));


  };

  const isFormValid = () => {
    return (
      formData.customer_name && 
      formData.items.length > 0 &&
      formData.items.every(item => item.item_code)
    );
  };

  const onClose = () => {
    setVisible(false);
    setCriarFactura(false);
  };

  const unformatCurrency = (formattedValue) => {
    if (!formattedValue) return 0;
    // Remove all non-digit characters except decimal point
    const numericString = formattedValue.toString()
      .replace(/[^0-9.]/g, '');
    return parseFloat(numericString) || 0;
  };

  const calculateGrandTotal = () => {
    const formatarMoeda = new Intl.NumberFormat();
    return formData.items.reduce((sum, item) => {
      console.log(sum)
      console.log('vvvv')
      console.log(unformatCurrency(item.total))
      console.log(formatarMoeda.format(sum+unformatCurrency(item.total)) || 0)
      console.log('valor')
      console.log(formatarMoeda.format(sum + (unformatCurrency(item.total)) || 0));
      return sum+unformatCurrency(item.total) || 0;
    }, 0);
  };  

  const calculateDueDate = (postingDate) => {
    if (!postingDate) return '';
    const date = new Date(postingDate);
    date.setDate(date.getDate() + 30);
    return format(date, 'yyyy-MM-dd');
  };  

  const UnpaidFacturas = ({ item }) => (
    <View>
      <Text>{item}</Text>
    </View>
  );

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
      marginTop: 1,
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
    grandTotalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: '#f0f0f0',
      borderRadius: 5,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    grandTotalLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    grandTotalValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2196F3',
    },    
    dateInput: {
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    dateText: {
      color: '#000',
    },    
    // Add these new styles:
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    halfWidthInput: {
      flex: 1,
    },
    leftInput: {
      marginRight: 8,
    },
    rightInput: {
      marginLeft: 8,
    },
        
  });


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


  
    db.getDocList('Customer', {
      fields: ["name"],
      filters: [['disabled','!=',1]],
      limit_start: 5,
      limit: 20,
      orderBy: {
        field: "customer_name",
        order: 'desc',
      },
    }).then((data) => {
      console.log('Customers data:', data);
      setcustomerOptions(data);
      // Initialize formData with first customer if not already set
      /*
      if (data.length > 0 && !formData.customer_name) {
        setFormData(prev => ({
          ...prev,
          customer_name: data[0].name
        }));
      }
        */
    })

    //{ code: 'ITM001', name: 'Laptop', description: '15" Business Laptop', price: 899.99, uom: 'EA' },
    //ITEM
    db.getDocList('Item', {
      fields: ["name","item_code","item_name","description","standard_rate","stock_uom"],
      filters: [['disabled','!=',1]],
      limit_start: 5,
      limit: 20,
      orderBy: {
        field: "name",
        order: 'desc',
      },
    }).then((data) => {
      console.log('ITEMS/PRODS data:', data);
      const formattedItems = data.map(item => ({
          code: item.item_code || item.name,
          name: item.item_name,
          description: item.description,
          price: item.standard_rate,
          uom: item.stock_uom
        }));
        setitemOptions(formattedItems);
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
                    renderItem={({ item }) => (
                      <Card key={item.name} style={{ width: "100%", marginBottom: 20 }}>
                        <Text style={{ fontSize: 10 }}>
                          {item.posting_date ? format(item.posting_date, "dd-MM-yyyy") : ''} - 
                          {item.doc_agt || ''} - 
                          {item.customer || ''}
                        </Text>
                        <Text category="h6" style={{ fontSize: 12, color: 'red' }}>
                          {item.outstanding_amount ? new Intl.NumberFormat().format(item.outstanding_amount) : ''}
                        </Text>
                        <Button 
                          onPress={() => {
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
                    )}
                    estimatedItemSize={100}
                    keyExtractor={(item) => item.name}
                  />


              </View>
            </Card>
          </View>
        )}
        
        <Modal visible={visible} animationType="slide" transparent={false}>
          <ScrollView style={styles.container}>
            <Text style={styles.header}>Sales Invoice</Text>
            
            {/* Customer Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer Name</Text>
              <Picker
                selectedValue={formData.customer_name}
                onValueChange={(value) => handleInputChange('customer_name', value)}
                style={styles.picker}
                
              >
                <Picker.Item label="Select a Customer..." value="" /> {/* Blank/default option */}
                {customerOptions.map((customer, index) => (
                  <Picker.Item 
                    key={customer.name} 
                    label={customer.customer_name || customer.name} 
                    value={customer.name} 
                  />
                ))}
              </Picker>
              {!formData.customer_name && (
                    <Text style={{color: 'red', fontSize: 12}}>Customer is required</Text>
                  )}

            </View>


            {/* Posting Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Posting Date</Text>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(true)}
                style={styles.dateInput}
              >
                <Text style={styles.dateText}>
                  {formData.posting_date || 'Select a date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={parseCustomDate(formData.posting_date)}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
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

            {/* Due Date (read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date (30 days)</Text>
              <View style={styles.dateInput}>
                <Text style={styles.dateText}>
                  {formData.due_date || 'Will calculate after posting date is selected'}
                </Text>
              </View>
            </View>


            <Text style={[styles.header, { marginTop: 2 }]}>Items</Text>
            
            {/* Items Table */}
            {formData.items.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemHeader}>Item #{index + 1}</Text>
                
                {/* Item Code */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Item Code *</Text>
                  <Picker
                    selectedValue={item.item_code}
                    onValueChange={(value) => handleItemChange(index, 'item_code', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select an item..." value="" /> {/* Blank/default option */}
                    {itemOptions.map((option, idx) => (
                      <Picker.Item 
                        key={option.code} 
                        label={`${option.code} - ${option.name}`}  
                        value={option.code} 
                      />
                    ))}
                  </Picker>
                  {!item.item_code && (
                    <Text style={{color: 'red', fontSize: 12}}>Item code is required</Text>
                  )}
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

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {/* Price */}
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Price</Text>
                    <TextInput
                      style={styles.input}
                      value={item.price.toString()}
                      onChangeText={(text) => handleItemChange(index, 'price', text)}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Quantity */}
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Quantity</Text>
                    <TextInput
                      style={styles.input}
                      value={item.qtd}
                      onChangeText={(text) => handleItemChange(index, 'qtd', text)}
                      keyboardType="numeric"
                    />
                  </View>
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

            {/* Grand Total Section */}
            <View style={styles.grandTotalContainer}>
              <Text style={styles.grandTotalLabel}>Grand Total:</Text>
              <Text style={styles.grandTotalValue}>
                AOA {new Intl.NumberFormat().format(calculateGrandTotal())}

              </Text>
            </View>

            {/* Add Item Button */}
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Text style={styles.addButtonText}>+ Add Item</Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, !isFormValid() && {backgroundColor: '#cccccc'}]} 
                onPress={handleSubmit}
                disabled={!isFormValid()}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
        </Modal>
      </Layout>
    </SafeAreaView>
  );
};

