## Assistant

#### Register

`POST /api/users/register`

```json
# request body
{
  "code",
  "email",
  "role",
  "password",
  "phone"
}
```

```json
# response body
{
  "_id",
  "name",
  "phone",
  "teacherId",
  "date"
}
```

#### Login

`POST /api/users/login`

```json
# request body
{
  "email",
  "password",
}
```

```json
# response body
{
  "_id",
  "role",
  "isAdmin",
  "date"
}

# response headers
"x-auth-token"
```

## Group

#### Create group

`POST /api/groups/create_group`

```json
# req body
{
  "name"
}
# req headers
"x-auth-token" -> of the assistant
```

```json
# res body
{
  "attendance_record": {
    "number": 0,
    "details": []
  },
  "students": {
    "number": 0,
    "details": []
  },
  "name": "Group 1",
  "teacherId": "pBoI9qkMz",
  "_id": "zrHiAcc0v",
  "date": "2019-06-02T05:00:31.104Z",
  "__v": 0
}
```

#### Add student to group

`POST /api/groups/group_zrHiAcc0v/add_student`

```json
# req body
{
  "name",
  "phone"
}
# req headers
"x-auth-token" -> of the assistant
```

```json
# res body

{
  "code"
}
```

#### Set new attendance record

`GET /api/groups/group_zrHiAcc0v/set_new_attendance_record`

```json
# res body
{
  "_id",
  "date"
}
```

#### Recorde student attendance

`GET /api/groups/group_zrHiAcc0v/record_attendance/student_iNwCDfafe`

```json
# res body
{
  "student": {
    "attendance": {
      "number": 1,
      "details": [
        "2019-6-2 07:01:17"
      ],
      "hasRecordedAttendance": true
    },
    "absence": {
      "number": 0,
      "details": []
    },
    "attendancePayment": {
      "number": 0,
      "details": []
    },
    "booksPayment": {
      "number": 0,
      "details": []
    },
    "studentId": "",
    "phone": "01115477547",
    "_id": "iNwCDfafe",
    "teacherId": "pBoI9qkMz",
    "groupId": "zrHiAcc0v",
    "name": "Ahmed Mohamed",
    "__v": 2
  }
}
```

#### Student details

`GET /api/groups/student_iNwCDfafe`

```json
# res body

{
  "student": {
    "attendance": {
      "number": 1,
      "details": [
        "2019-6-2 07:01:17"
      ],
      "hasRecordedAttendance": true
    },
    "absence": {
      "number": 0,
      "details": []
    },
    "attendancePayment": {
      "number": 0,
      "details": []
    },
    "booksPayment": {
      "number": 0,
      "details": []
    },
    "studentId": "",
    "phone": "01115477547",
    "_id": "iNwCDfafe",
    "teacherId": "pBoI9qkMz",
    "groupId": "zrHiAcc0v",
    "name": "Ahmed Mohamed",
    "__v": 2
  }
}
```
