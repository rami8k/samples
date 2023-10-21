const data = [
  { id: 1, sectionId: 1, areaId: 1, description: "Your Code of Conduct covers privacy and data protection principles", controlStatusId: 1, controlInPlaceId: 1, riskId: 1, comments: "", guidance: "Insert a section related to privacy and data protection into your Code of Conduct that accounts for each Regulation's six governing principles."},
  { id: 2, sectionId: 1, areaId: 1, description: "You have a corporate policy that covers GDPR requirements ", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 3, sectionId: 1, areaId: 1, description: "You have an Information Security Policy", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: "", guidance: "Develop and maintain an Information Security Policy that covers all of the fundamental objectives and elements of safeguarding employee, customer, and third parties' personal data - integrate GDPR-specific processes into the basic policy."},
  { id: 4, sectionId: 1, areaId: 1, description: "You have a Records and Information Management Policy", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 5, sectionId: 1, areaId: 1, description: "You have Data Breach / Incident Response Procedures", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 6, sectionId: 1, areaId: 1, description: "You have a Business Continuity Plan Policy ", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 7, sectionId: 1, areaId: 1, description: "You have documented procedures for storing personal data", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 8, sectionId: 1, areaId: 1, description: "You have Human Resources Policies on employee data rights", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 9, sectionId: 1, areaId: 2, description: "You have reviewed the 99 articles of the GDPR and related guidance to determine how the regulation applies to your operations", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 10, sectionId: 1, areaId: 2, description: "You maintain a GDPR program that captures how your controls and practices align with the GDPR requirements", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 11, sectionId: 1, areaId: 3, description: "You conduct a regular data mapping exercise to remain current on your data processing activities", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 12, sectionId: 1, areaId: 3, description: "Your data mapping exercise entails information collected on:-\r\n•    What personal data you hold\r\n•    Where it came from\r\n•    Who you share it with\r\n•    Legal basis for processing it\r\n•    What format(s) is it in\r\n•    Who is responsible for it\r\n•    Access level, sectionId: 1", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 13, sectionId: 1, areaId: 4, description: "You have assessed and documented whether you are a ‘Data Controller', ‘Data Processor’ or both", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 14, sectionId: 1, areaId: 5, description: "If you have obligations under any data protection Codes of Conduct or Certifications, do you disseminate these codes/requirements to all staff?", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 15, sectionId: 1, areaId: 6, description: "Your GDPR Program requires  the design of systems to include from the beginning appropriate technical and organizational measures to help meet the requirements of the Regulation and protect the rights of data subjects", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 16, sectionId: 1, areaId: 7, description: "Your GDPR Program requires the implementation of appropriate technical and organizational measures not only to ensure compliance, but also to demonstrate these measures are in place:\r\n• Six Principles – comply with the Regulation’s six general principles: \r\n• Lawful, Fair and Transparent Processing \r\n• Purpose Limitation \r\n• Data Minimization  \r\n• Data Accuracy\r\n• Storage Limitation \r\n• Integrity and Confidentiality", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 17, sectionId: 1, areaId: 8, description: "Your GDPR Program designates roles and responsibilities", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 18, sectionId: 1, areaId: 9, description: "Your  HR policies and procedures  are current (and if applicable, revised) to ensure that employee’s individual rights under the GDPR are considered and complied with", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 19, sectionId: 1, areaId: 10, description: "You monitor and report metrics for data processing activities", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 20, sectionId: 1, areaId: 11, description: "You maintain a current resource to assist with questions from data subjects as further  documentation to help demonstrate compliance with GDPR", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},

  { id: 21, sectionId: 2, areaId: 12, description: "You have designated responsibility for GDPR compliance to a Data Protection Officer (DPO) or similar role", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 22, sectionId: 2, areaId: 13, description: "Your DPO has sufficient access, support and the budget to perform the role", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 23, sectionId: 2, areaId: 13, description: "You have assured that there are reporting mechanisms between the DPO and senior management", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 24, sectionId: 2, areaId: 14, description: "You have instituted a working group headed by the  DPO to oversee your GDPR Program and its data protection governance structure", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 25, sectionId: 2, areaId: 15, description: "You have informed all employees of the DPO's appointment and contact details", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 26, sectionId: 2, areaId: 15, description: "You have published the contact details of your DPO", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 27, sectionId: 2, areaId: 15, description: "You have communicated the DPO's contact details to the relevant Supervisory Authority(ies)", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 28, sectionId: 2, areaId: 16, description: "You require the DPO to have expertise in GDPR requirements and any other relevant and applicable data protection laws and practices", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 29, sectionId: 2, areaId: 16, description: "You require the DPO to know your business sector and organization", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 39, sectionId: 2, areaId: 16, description: "You require the DPO to have a sufficient understanding of your processing operations", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 31, sectionId: 2, areaId: 17, description: "You have assigned responsibilities to your DPO, including:\r\n•    inform and advise the business, management, employees and third-parties who carry out processing, of their obligations under the GDPR\r\n•    monitor compliance with the GDPR and with the firm's own data protection objectives\r\n•    help raise awareness through communications and training to staff, management and as needed the board of directors\r\n•    provide advice on GDPR requirements where requested \r\n•    chair a project team or working group to oversee GDPR compliance\r\n•   cooperate with the Supervisory Authority\r\n•   serve as the contact point for the Supervisory Authority on issues relating to data processing", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 32, sectionId: 2, areaId: 18, description: "Your DPO is available for inquiries from data subjects on issues relating to data protection practices and their rights as well as to intermediate with Supervisory Authorities", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 33, sectionId: 2, areaId: 19, description: "You have empowered the DPO to oversee, develop and promote a GDPR compliant program", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 34, sectionId: 2, areaId: 19, description: "Your DPO oversees essential elements of the GDPR, such as:\r\n• the principles of data processing\r\n• data subjects’ rights\r\n• data protection by design and by default \r\n• records of processing activities\r\n• security of processing \r\n• notification and communication of data breaches", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 35, sectionId: 2, areaId: 20, description: "You have assured the DPO, if he has other tasks and duties, these responsibilities have been assessed to ensure there is no conflict of interest", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},

  { id: 36, sectionId: 3, areaId: 21, description: "You can always demonstrate that consent has been given", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 37, sectionId: 3, areaId: 22, description: "If processing is based on consent, your request for consent is made in a clear and transparent format, using plain language", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 38, sectionId: 3, areaId: 22, description: "Your consent request is made in an easily accessible format", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 39, sectionId: 3, areaId: 22, description: "Your request for consent is always presented in a manner that is clearly distinguishable from the other matters", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 40, sectionId: 3, areaId: 22, description: "Your  consent to processing is distinguishable, clear, and is not “bundled” with other written materials or matters", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 41, sectionId: 3, areaId: 22, description: "You require consent that is active, and do not rely on silence, inactivity or pre-ticked boxes", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 42, sectionId: 3, areaId: 22, description: "If personal data is collected directly from the data subject, you ensure that the below information is provided at the time of consent: \r\n• Identity and contact details of the controller (or controller’s representative)\r\n• Contact details of the Data Protection Officer\r\n• Purpose of the processing and the legal basis for the processing\r\n• The legitimate interests of the controller or third-party\r\n        • Any recipient or categories of recipients of the personal data\r\n     • Details of transfers to third country and safeguards\r\n• Retention period or criteria used to determine the retention period\r\n• The existence of each of data subject’s rights\r\n• The right to withdraw consent at any time, where relevant\r\n• The right to lodge a complaint with a supervisory authority\r\n• Whether the provision of personal data is part of a statutory or contractual requirement or obligation and possible consequences of failing to provide the personal data\r\n• The existence of automated decision-making and information about the logic involved and  the significant consequences for the data subject", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 43, sectionId: 3, areaId: 23, description: "You clearly state that the data subject has the right to withdraw consent at any time ", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 44, sectionId: 3, areaId: 23, description: "Your process for withdrawing consent is simple, accessible and quick", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 45, sectionId: 3, areaId: 23, description: "Your data subjects are informed that they have the right to withdraw consent at any time but that this will not affect the lawfulness of processing based on consent before its withdrawal", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 46, sectionId: 3, areaId: 23, description: "You use simple methods for withdrawing consent, including methods using the same medium used to obtain consent in the first place", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 47, sectionId: 3, areaId: 23, description: "You give data subjects of the right to withdraw before consent is given", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 48, sectionId: 3, areaId: 23, description: "Once consent is withdrawn, you give data subjects the right to have their personal data erased and no longer used for processing", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 49, sectionId: 3, areaId: 24, description: "You obtain separate consents for distinct processing operations ", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 50, sectionId: 3, areaId: 25, description: "When physically collecting personal information (i.e., face-to-face, telephone etc.), you have scripts to remind staff of the conditions for consent and an individual’s right to be informed", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 51, sectionId: 3, areaId: 26, description: "You have clear audit trails to evidence consent and where it came from", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 52, sectionId: 3, areaId: 27, description: "You use a Privacy Notice/Policy (on your website, contracts, emails, etc.) to ensure compliance with the conditions for consent and information disclosure rules", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 53, sectionId: 3, areaId: 28, description: "Your provision of good and services is not made contingent on consent to processing which is not necessary for the service being supplied", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 54, sectionId: 3, areaId: 29, description: "If the personal data is obtained and/or processed relating to a child under 16 years, you ensure that consent is given and documented by the holder of parental responsibility over the child", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 55, sectionId: 3, areaId: 29, description: "If services are provided to children, your privacy notice provides clear and plain information that is easy to understand by a child", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},

  { id: 56, sectionId: 4, areaId: 30, description: "Your notices include the purposes of processing and legal basis for processing ", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 57, sectionId: 4, areaId: 30, description: "Your notices include recipients, or categories of recipients", controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
]

module.exports = {
  findAll: function () {
    return data
  },
  findById: function (id) {
    return data.find(x => x.id === id)
  },
  findBySectionId: function (sectionId) {
    return data.find(x => x.sectionId === sectionId);
  },
  sync: function () {
  }
}