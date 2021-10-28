import React, { useState, useEffect } from 'react';
import {
    Flex,
    Heading,
    InputGroup,
    InputLeftElement,
    Input,
    Button,
    Text,
    IconButton,
    Divider,
    Link,
} from "@chakra-ui/react"; 
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
    useAuthUser,
    withAuthUser,
    withAuthUserTokenSSR,
    AuthAction,
} from 'next-firebase-auth';
import firebase from 'firebase/app';
import 'firebase/firestore';
import Header from '../components/Header';

const Event = () => {
  const AuthUser = useAuthUser();
  const [inputName, setInputName] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    AuthUser.id &&
      firebase
        .firestore()
        .collection("contact")
        .where( 'user', '==', AuthUser.id )
        .onSnapshot(
          snapshot => {
            setEvents(
              snapshot.docs.map(
                doc => {
                  return {
                    contactID: doc.id,
                    contactName: doc.data().name,
                    contactDate: doc.data().date.toDate().toDateString()
                  }
                }
              )
            );
          }
        )
  })

  const sendData = () => {
    try {
     
      firebase
        .firestore()
        .collection("contact") 
        .add({
          name: inputName,
          date: firebase.firestore.Timestamp.fromDate( new Date(inputDate) ),
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          user: AuthUser.id
        })
        .then(console.log('Data was successfully sent to cloud firestore!'));
      
      setInputName('');
      setInputDate('');

    } catch (error) {
      console.log(error);
    }
  }

  const deleteEvent = (t) => {
    try {
      firebase
        .firestore()
        .collection("contact")
        .doc(t)
        .delete()
        .then(console.log('Data was successfully deleted!'));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Header 
        email={AuthUser.email} 
        signOut={AuthUser.signOut} />
      <Flex flexDir="column" maxW={800} align="center" justify="start" minH="100vh" m="auto" px={4} py={3}>
        <InputGroup>
          <InputLeftElement
            pointerContact="none"
            children={<AddIcon color="gray.300" />}
          />
          <Input type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Contact Title" />
          <Input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} placeholder="Contact Date" />
          <Button
            ml={2}
            onClick={() => sendData()}
          >
            Add
          </Button>
        </InputGroup>

        {events.map((item, i) => {
          return (
            <React.Fragment key={i}>
              {i > 0 && <Divider />}
              <Flex
                w="100%"
                p={5}
                my={2}
                align="center"
                borderRadius={5}
                justifyContent="space-between"
              >
                <Flex align="center">
                  <Text fontSize="xl" mr={4}>{i + 1}.</Text>
                  <Text>
                    <Link href={'/events/' + item.contactID}>
                    {item.contactName}
                    </Link>
                  </Text>
                  <Text>... {item.contactDate}</Text>
                </Flex>
                <IconButton onClick={() => deleteEvent(item.contactID)} icon={<DeleteIcon />} />
              </Flex>
            </React.Fragment>
          )
        })}
      </Flex>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, req }) => {
  return {
    props: {
    }
  }
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
})(Contact)