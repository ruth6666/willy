import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import AppHeader from '../Components/AppHeader'
export default class ReadStory extends React.Component {
    render(){
    return (
      <View style={{backgroundColor:'lightgreen', flex:1, justifyContent:'center', alignItems:'center'}}>
        <AppHeader/>
        <Text>Read Story</Text>
      </View>
    );
  }
  }