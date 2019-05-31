### **Set new attendance record**

**Application:**

- A new attendance record is added to that group with unique id, teacher id and the current date in the following form

```js
{
  _id: String,
  teacherId: String,
  date: String
}
```

The number of attendance of that group will be recorded to, this is the overall shape in the Group table

```js
attendance_record: {
  number: Number,
  details: { _id: ..., teacherId: ..., date: ...}
}
```

The benefits of this approach is it enables recording students with QR code and no student can check his attenance on his own due to the unique id and the date.

### **Record attendance (Usint QR Code)**

**User story:**

- Assistantc clicks on the group to set a new attendance record
- When clicked a QR code will be generated.
- Students will scan that QR code to record their attendace
- If a student came from another group the assistant will record his attendance manually. (We might generate a QR code for those who come from another group).
- The assistnat clicks on student from another group button.
- The assistant enters the ID of the student in the pop up.

**Application:**

- Expects a GET request on `/api/groups/group_:id/record_attendance` or `/api/groups/group_:id/record_attendance?another_group`.
- Student attendance is recorded by removing his latest absence (made by set new attendance reocrd action) and adding a incrementing his attencance count and adding the date in the group attencance to his attendance date.

_Requirements:_

- Teacher to create the assistant.
