# POKER PLANNER

Poker planner is an application that provides a powerful and fun way to improve planning and estimation ceremonies for remote and in-person teams. Instantly import stories from your favorite project management platform like Jira. Discuss the scope and effort of each story as a team, then compare everyone’s anonymous estimate. If the team doesn’t come to a consensus, have a discussion to better understand the work, then estimate again until the team reaches an agreement. When you’re done, simply export your estimates and notes back to your favorite project management tool.

### Basic requirements to setup
1. Must have postgres
2. Python version 3.8 and the pip version 23.0.1

### Setup folder structure/Deployment
1. Create the folder in your local storage with the folder name as POKERPLANNER
2. Open your POKERPLANNER folder on your computer and right click on your mouse and click open in terminal
3. Write code . in your command prompt terminal
4. Open the terminal of your VsCode by click on the terminal and then new terminal
5. Clone the github file by writing  git clone https://github.com/jtg-induction/BE-Poker-Planner on your terminal of the vsCode.
6. Type cd BE-Poker-Planner on your terminal of the vsCode.
7. Now type pip install pipenv
8. Now type the command (pipenv install)
9. Create the database in your computer by typing following commands on your command prompt of your computer1
10. sudo -u postgres psql(shell will open)
11. CREATE DATABASE <your databse name>;
12. \c<your database name>;
13. CREATE USER <username> WITH PASSWORD '<your password>';
14. GRANT ALL PRIVILEGES ON DATABASE <your database name> TO <your database username>
15. \q
16. Now create a .env file in the pokerplanner folder
17. Now write down your database details in your .env file (for structure of the file open the env.template file present in BE-POKER-PLANNER folder)
18. Secret key is present in your settings file
19. Now create new terminal in your vs code and type cd BE-POKER-PLANNER
20. Type python3 manage.py migrate (create all the table to the database)
21. Now create the superuser by typing in the terminal (python3 manage.py createsuperuser and fill yours details)

## To run the server
> Type python3 manage.py runserver and follow the link
> To check all the table write /admin in front of the link
