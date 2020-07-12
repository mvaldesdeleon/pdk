# Pricing Development Kit (PDK)

The **Pricing Development Kit (PDK)** is a software development framework to define cloud infrastructure pricing definitions in code and generate updated cost estimate reports.

It offers a high-level object-oriented abstraction to define pricing components imperatively using the power of modern programming languages. Using the PDK’s library of infrastructure pricing constructs, you can easily encapsulate AWS infrastructure pricing within your own pricing component definitions and share them without worrying about boilerplate logic.

The PDK is available in the following languages:

* JavaScript, TypeScript

Developers use the PDK framework in one of the supported programming languages to define reusable cloud pricing components called pricing constructs, which are composed together to describe the overall solution or application. These pricing constructs are commonly defined in terms of magnitudes that are simpler to quantify or estimate, such as desired backup frequency and retention, than the underlying AWS infrastructure pricing constructs, in this case overall storage used per month.

Using the capabilities of the supported programming languages, developers can encapsulate and simplify the complex logic rules usually implemented via pricing spreadsheets. They can also create pricing definitions across multiple different configurations with ease allowing fast access to what-if scenarios, even programatically.

Developers can then use the PDK CLI to interact with their PDK pricing definitions, and generate updated cost estimate reports in a variety of formats such as text, PDF or Microsoft Excel. The PDK CLI leverages the AWS Price List API to provide updated cost estimates on demand, and most services are supported. It is also able to aggregate across the underlying AWS pricing constructs whenever possible, such that volume discounts are applied based on the aggregated value rather than the individual instances.

The Pricing Construct Library includes a module for each AWS service with constructs that offer rich APIs that encapsulate the details of how each AWS service is priced. The Pricing Construct Library aims to reduce the complexity and glue-logic required when integrating various AWS services to achieve your cost estimation goals on AWS.
