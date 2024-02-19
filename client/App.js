import { StatusBar } from 'expo-status-bar';
import {StyleSheet, Text, View, Button, Alert, FlatList, TextInput} from 'react-native';
import {Post} from "./components/Post";
import axios from "axios";
import React from 'react';


export default function App(){
    let getClients = () =>{
      fetch("https://client-orbitel45.ru/api/v1/clients")
          .then(res =>{
              console.log(res.status);
              console.log(res.header);
              return res.json();
          })
          .then(
              (result) =>{
                console.log(result);
          },
              (error) =>{
                  console.log(error);
              }
          )
    };

    return (
        <View style={styles.container}>
            <TextInput placeholder='Employee Id' style={styles.input} value={client_id} onChangeText={(value) => setClientId(value)} />
            <TextInput placeholder='Employee Name' style={styles.input} value={client_name} onChangeText={(value) => setClientName(value)} />
            <Button title="Get" onPress={getClients} />
            <Button title="Get By Id" onPress={() => getClients(client_id)}/>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        alignSelf: "stretch",
        margin: 8,
        padding: 4
    }
});
