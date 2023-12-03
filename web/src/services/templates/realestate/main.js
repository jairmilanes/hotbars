


class RealEstateMainController {

  async handle(req) {
    const context = {}

    context.socialLinks = [
      { name: "facebook", href: "#" },
      { name: "twitter", href: "#" },
      { name: "instagram", href: "#" },
      { name: "youtube", href: "#" }
    ];

    context.menu = [
      { label: "About Us", href: "#" },
      { label: "Treatments", href: "#" },
      { label: "Testimonials", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact Us", href: "#" },
    ];

    context.features = [
      {
        title: "Rent a Property",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy indxgo juice poutine, ramps microdosing banh mi.",
        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "Buy a Property",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy indxgo juice poutine, ramps microdosing banh mi.",
        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "Sell a Property",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy indxgo juice poutine, ramps microdosing banh mi.",
        actionHref: "#",
        actionLabel: "Learn More"
      }
    ];

    context.appointment = true;

    context.listings = [
      {
        title: "$3.500",
        category: "619 THE QUEENSWAY Toronto, Ontario M8Y1K2",
        imageUrl: "/public/templates/realestate/images/house-01.jpg"
      },
      {
        title: "$3.200",
        category: "49 SPENVALLEY DR S Toronto, Ontario M3L1Y9",
        imageUrl: "/public/templates/realestate/images/house-02.jpg"
      },
      {
        title: "$2.800",
        category: "#404 -1990 BLOOR ST W Toronto, Ontario M6P3L1",
        imageUrl: "/public/templates/realestate/images/house-03.jpg"
      },
      {
        title: "$2.300",
        category: "619 THE QUEENSWAY Toronto, Ontario M8Y1K2",
        imageUrl: "/public/templates/realestate/images/house-04.jpg"
      },
      {
        title: "$4.100",
        category: "619 THE QUEENSWAY Toronto, Ontario M8Y1K2",
        imageUrl: "/public/templates/realestate/images/house-05.jpg"
      },
      {
        title: "$3.400",
        category: "619 THE QUEENSWAY Toronto, Ontario M8Y1K2",
        imageUrl: "/public/templates/realestate/images/house-06.jpg"
      },
      {
        title: "$2.900",
        category: "619 THE QUEENSWAY Toronto, Ontario M8Y1K2",
        imageUrl: "/public/templates/realestate/images/house-07.jpg"
      },
      {
        title: "$3.800",
        category: "619 THE QUEENSWAY Toronto, Ontario M8Y1K2",
        imageUrl: "/public/templates/realestate/images/house-08.jpg"
      }
    ]

    context.testimonials = [
      {
        name: "John Doe",
        body: "Edison bulb retro cloud bread echo park, helvetica stumptown taiyaki taxidermy 90's cronut +1\n" +
          "      kinfolk. Single-origin coffee ennui shaman taiyaki vape DIY tote bag drinking vinegar cronut\n" +
          "      adaptogen squid fanny pack vaporware. Man bun next level coloring book skateboard four loko\n" +
          "      knausgaard.",
        position: "Senior Analist"
      }
    ]

    return context;
  }
}

module.exports = RealEstateMainController;