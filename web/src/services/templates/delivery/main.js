


class DeliveryMainController {

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
        title: "FRESH INGREDIENTS",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy indxgo juice poutine, ramps microdosing banh mi.",
        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "HEALTHY MEALS",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy indxgo juice poutine, ramps microdosing banh mi.",
        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "COOKED WITH LOVE",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy indxgo juice poutine, ramps microdosing banh mi.",
        actionHref: "#",
        actionLabel: "Learn More"
      }
    ];

    context.appointment = true;

    context.categories = [
      {
        category: "Hamburguers",
        imageUrl: "/public/templates/delivery/images/category-01.jpg"
      },
      {
        category: "Sea Food",
        imageUrl: "/public/templates/delivery/images/category-02.jpg"
      },
      {
        category: "Breakfast",
        imageUrl: "/public/templates/delivery/images/category-03.jpg"
      },
      {
        category: "BBQ",
        imageUrl: "/public/templates/delivery/images/category-04.jpg"
      }
    ]

    context.listings = [
      {
        title: "$3.500",
        category: "619 THE QUEENSWAY Toronto, Ontario M8Y1K2",
        imageUrl: "/public/templates/delivery/images/food-01.jpg"
      },
      {
        title: "$3.200",
        category: "49 SPENVALLEY DR S Toronto, Ontario M3L1Y9",
        imageUrl: "/public/templates/delivery/images/food-02.jpg"
      },
      {
        title: "$2.800",
        category: "#404 -1990 BLOOR ST W Toronto, Ontario M6P3L1",
        imageUrl: "/public/templates/delivery/images/food-03.jpg"
      },
      {
        title: "$2.300",
        category: "619 THE QUEENSWAY Toronto, Ontario M8Y1K2",
        imageUrl: "/public/templates/delivery/images/food-04.jpg"
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

module.exports = DeliveryMainController;