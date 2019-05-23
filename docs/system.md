# Teacher

### **Register:**

**User story:** 

* Teacher has a code that was given to him by the admin
* He enters the code along with his credentials to sign up as a teacher.

**Application:** 

* Expects a POST request on `/api/users/register`
* Returns `200 OK`  or `{ error: error_message }` if an error occured
* Teaher schema:
```js
{
    _id: String,
    name: String,
    email: String,
    password: String,
    students: {
        number: Number,
        details: [{ _id: String, name: String }, ...]
    },
    assistants: {
        number: Number,
        details: [{ _id: String, name: String }, ...]
    },
    groups: {
        number: Number,
        details: [{ _id: String, name: String }, ...]
    },
    recently_verified: Date,
    is_admin: Boolean,
    date: Date
}
```

_Requirements:_ 

* Admin to create the teacher.
* Register logic for the teacher.


### **Adding Assistant:**

**User story:** 

* Teacher clicks on add an assistant button.
* He then enters the name of the assistant.
* A generated code will appear to him that should be the assistant code.

**Application:** 

* Expects a POST request on `/api/teacher/add_assistant`
* Expects a `name` field in the body.
* Returns the generated code and the assistant name or `{ error: error_message }` if an error occured.

_Requirements:_

* Teacher to create the assistant.


### **Removing Assistant:**

**User story:** 

* Teacher clicks on remove an assistant button
* An email is then should be deliverd to the teacher email address in order to confirm identity and the action
* If the link in the email address is clicked then the assistant will be removed.

**Application:**

* Teacher sends a DELETE request on `/api/teacher/assistants/remove/assistant_{id}`
* If the assistant was just created the teacher can delete it immidiately, other wise the following work flow is required.
* A unique code will be generated and sent to the teacher email address.
* This Unique code is the id of an element in a special database for verfying delete requests.
* The id is available only for 15 minutes.
* When the id is enterd, we get the table of it and check for the time in the DB and the current time, if more than 15 minutes passed we delete the entry from the table and inform the teacher that more than 15 mins elpased.
* If less than 15 mins elpased we delete the assistant from Assistants DB, from the Teacher DB and from Users DB.

_Requirements:_

* Teacher
* Assistant
* Deletion Verifying DB
* Mail service

# Assistant

## **Register:**

**User story:** 

* Assistant has a code that was given to him by the teacher.
* He enters the code along with his credentials to sign up as a assistant.

**Application:** 

* Expects a POST request on `/api/users/register`
* Returns `200 OK`  or `{ error: error_message }` if an error occured.

_Requirements:_ 

* Teacher to create the assistant.
* Register logic for the assistant.
* Assistant schema:
```js 
{
    _id: String,
    name: String,
    email: String,
    teacher_id: String
}
```

## **Create group:**

**User story:** 

* Assistant clicks on add group button from his home screen.
* Assistant enters the name of the group.

**Application:** 

* Expects a POST request on `/api/assistants/assistant_{id}/create_group` with the assistant's token
* Returns the `group_name`  or `{ error: error_message }` if an error occured.
* Group schema: 
```js
{
    _id: String,
    name: String,
    teacher_id: String,
    students: [{ _id: String, name: String }]
}
```

_Requirements:_ 

* Assistant to create the group.
* Register logic for the assistant.


## **Remove Group:**

**User story:** 

* Assistant clicks on the group he wants to delete.
* Assistant clicks on delete group button from the group info.
* The steps taken is then the same as **Removing an assistant**

**Application:**

* Expects a DELETE request on `/api/groups/group_{id}/remove with the assistant token.
* The scenario then follows the same as removing an assistant.

_Requirements:_

* Assistant
* Group
* Mail service


## **Adding Student:**

**User story:** 

* Assistant clicks on the group that the student will be added to.
* Assistnat clicks on add student button.
* Assistant enters the name of the student.
* A code will be shown to the assistant that the student will use in order to be added to the group.

**Application:** 

* Expects a POST request on `/api/groups/group_{id}/add_student` with the token of an assistant.
* Expects a `name` field in the body.
* Returns the generated code and the student name or `{ error: error_message }` if an error occured.
* Student Teacher schema:
```js
{
    _id: Code_Given_By_The_Assistant,
    name: String,
    teacher_id: String,
    group_id: String,
    attendance: {
        number: Number, // how attendance is gonna be calculated?
        details: ['2019-05-20', ...]
    },
    degrees: {
        number: Number, // how attendance is gonna be calculated?
        details: [{ exam_id: String, degree: String }, ...]
    },
    attendance_payment: {
        number: Number, // the number of times the student has paid
        details: ['2019-05-20', ...]
    },
    books_payment: {
        number: Number,
        details: ['2019-05-20', ...]
    }
}
```

_Requirements:_

* Assistant to create the student.
* Existing student.
* Group to add the student to.


## **Remove Student:**

**User story:** 

* Assistant clicks on the group that the student will be removed from or search for the student.
* If the assistant is in a group, he goes to student details and enter the student code.
* In the student details there is a reomve student button that will totally remove that student from the teacher.
* A confirmation dialog will appear to the teacher to inform him that this action is not reversible.


**Application:**

* Expects a DELETE request on `/api/groups/group_{id}/students/student_{id}/remove` with the assistant token.

_Requirements:_

* Assistant
* Group
* Student in the group

## **Transfere student:**

**User story:**

* Assistant clicks on transform student from his home screen or from a group.
* Assistant enters the student code or name that will be transfered.
* A list of available groups will be displayed to the assistant to choose from.

**Application:**

* Expects a GET 