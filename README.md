# Smarter Advocacy

This cloud-native express/node.js microservice, is part of a set which comprise a 'Smarter Advocacy' capability. More details about this will follow soon.

# The microservice in this repo

The simple goal for this microservice is to offer a stateless generic capability, that gets the latest JSON report from a CouchDB instance and returns it in HTML for the browser.

**Example OUTPUT:**   
In this twitter case, 
- On the left; follower, tweet and like total and delta metrics are display ever, monthly and daily.
- On the right; every tweet made, with text, publiushed date, retweet and like counts are displayed.

![examle twitter JSON output](images/example-output.png?raw=true "examle twitter JSON output")

**For you to build and deploy:**  
- For development use, using Codewind is recommended - see how in this [separate BLOG here](https://medium.com/nikcanvin/how-to-develop-update-a-docker-microservice-in-a-git-repo-a6118da2d92f).!
- For production use, here are tips how to build, deploy and run this cloud-native express/node.js microservice, are in a 
[separate BLOG here](https://medium.com/nikcanvin/how-to-build-a-docker-microservice-application-and-deploy-to-openshift-fdb0769f1b9f).

**Only within IBM, this microservice is already deployed:**  
- [deployed on a OpenShift cluster here](http://display-report-default.apps.riffled.os.fyre.ibm.com/)

**Overview of workflow:**  
![overview picture](images/overview.png?raw=true "Diagramatic overview of this picture")

**Supported reports:**
1. Twitter user/tweet.
2. YouTube Channel videos

**Notes:**
1. support for many more channels was planned, but yet to be implemented.
2. currently, the microservice is hardcoded to pull the resultant JSON document to a hardcorded COUCHDB instance (but we should probably split the microservice into two parts, to separate latest report retrieval and display.

...

![Codewind logo](images/codewind.png?raw=true "Codewind logo")

***This microservice was created and iteratively developed using [Codewind](https://www.eclipse.org/codewind/).***  
*Codewind is an open source plugin for Eclispe and VS Code IDEs, that simplifies and enhances development in containers by extending industry standard IDEs with features to write, debug, and deploy cloud-native applications.* 