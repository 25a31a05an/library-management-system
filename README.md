# library-management-system
A Java-based Library Management System that simplifies library operations. It allows users to add, view, search, issue, and return books. It uses classes, objects, ArrayList, and Scanner to manage book records efficiently, reduce manual work, and save time.

# Website Link

[https://monumental-peony-7b09c4.netlify.app]

# Flow chart

![Library Management System Flowchart](library-flowchart.png)

# Code

import java.util.*;
class Book{
int id;String name;boolean issued;
Book(int i,String n){id=i;name=n;}
}
public class LibraryManagementSystem{
static ArrayList<Book>b=new ArrayList<>();
static Scanner s=new Scanner(System.in);
public static void main(String[]args){
int c,id;
do{
System.out.println("\n1.Add 2.View 3.Search 4.Issue 5.Return 6.Exit");
c=s.nextInt();
switch(c){
case 1:
id=s.nextInt();s.nextLine();
b.add(new Book(id,s.nextLine()));
System.out.println("Added!");
break;
case 2:
for(Book x:b)System.out.println(x.id+" "+x.name+" "+(x.issued?"Issued":"Available"));
break;
case 3:case 4:case 5:
id=s.nextInt();boolean f=false;
for(Book x:b)if(x.id==id){
f=true;
if(c==3)System.out.println(x.name);
else{x.issued=c==4;System.out.println(c==4?"Issued!":"Returned!");}
break;
}
if(!f)System.out.println("Not Found!");
break;
case 6:System.out.println("Thank You!");break;
default:System.out.println("Invalid Choice!");
}
}while(c!=6);
s.close();
}
}

# Output

1.Add Book
2.View Books
3.Search Book
4.Issue Book
5.Return Book
6.Exit

Enter Choice: 1
Enter ID: 101
Enter Name: Java
Book Added!

Enter Choice: 2
101 Java Available

Enter Choice: 4
Enter Book ID: 101
Book Issued!

Enter Choice: 5
Enter Book ID: 101
Book Returned!

Enter Choice: 6
Thank You!
