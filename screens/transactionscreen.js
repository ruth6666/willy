import React from 'react'
import {Text, View, StyleSheet, TouchableOpacity, Image, TextInput, Alert} from 'react-native'
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import firebase from 'firebase';
import db from '../config'

export default class TransactionScreen extends React.Component{
    constructor(){
        super()
        this.state = {
            hasCameraPermission:null, scan:false, scanData:'', buttonState:'normal', scanBookID:'', scanStudentID:'', transactionMessage:'',

        }
    }
    getCameraPermission = async(id)=>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermission:status === "granted", 
            buttonState:id,
            scan:false
        })
    }
    handleBarcodeScan = async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState==='bookID'){
        this.setState({
            scan:true,
            scanData:data,
            buttonState:'normal'
        })
    }
    else if(buttonState==='studentID'){
        this.setState({
            scan:true,
            scanData:data,
            buttonState:'normal'
        })
    }
    }
    handleTransaction = async()=>{
        var transactionMessage = null
        db.collection('Books').doc(this.state.scanBookID).get().then((doc)=>{
            var book = doc.data()
            if(book.bookAvailability){
                this.initiateBookIssue()
                transactionMessage = 'Book Issued'
            }
            else{
                this.initiateBookReturn()
                transactionMessage = 'Book Returned'
            }
        })
        this.setState({transactionMessage:transactionMessage})
    }
    initiateBookIssue = async()=>{
        db.collection('Transaction').add({
            studentID:this.state.scanStudentID,
            bookID:this.state.scanBookID,
            date:firebase.firestore.Timestamp.now().toDate(),
            transactionType:'issue'
        })
        db.collection('Books').doc(this.state.scanBookID).update({
            bookAvailability:false
        })
        db.collection('Students').doc(this.state.scanStudentID).update({
            numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
        })
        Alert.alert('Book Issued')
        this.setState({
            scanBookID:'',
            scanStudentID:''
        })
    }
    initiateBookReturn = async()=>{
        db.collection('Transaction').add({
            studentID:this.state.scanStudentID,
            bookID:this.state.scanBookID,
            date:firebase.firestore.Timestamp.now().toDate(),
            transactionType:'issue'
        })
        db.collection('Books').doc(this.state.scanBookID).update({
            bookAvailability:true
        })
        db.collection('Students').doc(this.state.scanStudentID).update({
            numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
        })
        Alert.alert('Book Returned')
        this.setState({
            scanBookID:'',
            scanStudentID:''
        })
    }
    render(){
        const hasCameraPermission = this.state.hasCameraPermission
        const scan = this.state.scan
        const buttonState = this.state.buttonState
        if(buttonState !== 'normal' && hasCameraPermission){
            return(
                <BarCodeScanner onBarCodeScanned = {scan? undefined:this.handleBarcodeScan}
                style={StyleSheet.absoluteFillObject}/>
            )
        }
        else if(buttonState === 'normal'){
        return(<View style={styles.container}>
            <View><Image source = {require('../assets/booklogo.jpg')} style = {{width:200,height:200}}/><Text style={{textAlign:'center',fontSize:30,fontWeight:'bold'}}>Wireless Library</Text></View>
            <View style={styles.inputView}>
                <TextInput style={styles.inputBox}
                placeholder = 'Book ID'
                value = {this.state.scanBookID}/>
                <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCameraPermission('bookID')}} ><Text style={styles.buttonText}>Scan</Text></TouchableOpacity>
            </View>
            <View style={styles.inputView}>
                <TextInput style={styles.inputBox}
                placeholder = 'Student ID'
                value = {this.state.scanStudentID}/>
                <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCameraPermission('studentID')}}><Text style={styles.buttonText}>Scan</Text></TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.submitButton} onPress={async()=>{var transactionMessage=await this.handleTransaction()}}>
                <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
            </View>)
    }
}
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
 displayText:{ fontSize: 15, textDecorationLine: 'underline' }, 
 buttonText:{ fontSize: 15, textAlign: 'center', marginTop: 10 },
inputView:{ flexDirection: 'row', margin: 20 },
 inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20 }, 
 scanButton:{ backgroundColor: '#66BB6A', width: 50, borderWidth: 1.5, borderLeftWidth: 0 },
submitButton:{backgroundColor:'pink',width:50, height:20,},
submitButtonText:{textAlign:'center',fontSize:15,fontWeight:'bold',color:'blue',padding:10}
});